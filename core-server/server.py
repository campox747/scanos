import firebase_admin
from firebase_admin import credentials, firestore
import time
from paho.mqtt import client as mqtt_client
import sys
import json
import numpy as np
from sort import Sort

# --------------------------------------------------------------
# CONFIG
# --------------------------------------------------------------
# Class ID to item name mapping
CLASS_MAP = {
    1: "XRP-BOOK",
    2: "XRP-COKE",
    3: "XRP-MONSTER",
}

# The "Thick Line" Counting Zone
ZONE_X_MIN = 130
ZONE_X_MAX = 190

# Dictionaries to hold the tracking state for each individual item type
trackers = {}
counted_ids = {}
current_inventory = {}

# Initialize a tracker and memory set for each class
for class_id, item_name in CLASS_MAP.items():
    trackers[item_name] = Sort(max_age=15, min_hits=5, iou_threshold=0.3)
    counted_ids[item_name] = set()
    current_inventory[item_name] = 0

# --------------------------------------------------------------
# INITIALISATION MQTT and Firebase
# --------------------------------------------------------------
# Initialize MQTT client
client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION2)

# Establish connection to broker (mosquitto)
if client.connect("localhost", 1883, 60) != 0:
    print("Couldn't connect to broker")
    sys.exit

client.loop_start()

# Grab private key and init firebase
cred = credentials.Certificate("serviceAccountKey.json") 
firebase_admin.initialize_app(cred) # Init firebase
db = firestore.client()

# --------------------------------------------------------------
# INVENTORY UPDATE FUNCTION
# --------------------------------------------------------------

# updates firebase inventory with item counts from system
def update_inventory(item_counts):
    try:
        inventory_ref = db.collection("inventory")
        
        for item_id, count in item_counts.items(): # loops through data from robot, ex {"XRP-APPLE": 5, "XRP-BOOK": 12, "XRP-BOTTLE": 3} one at a time
            # Update or create the inventory document for this item
            inventory_ref.document(item_id).set({ #updates specific document
                "count": count,
                "lastUpdated": firestore.SERVER_TIMESTAMP,
            }, merge=True)  # merge=True preserves other fields
            
            print(f"✓ Updated {item_id}: {count} units")
        
        return True
    
    except Exception as e:
        print(f"✗ Error updating inventory: {e}")
        return False


# --------------------------------------------------------------
# VISION COUNTING LOGIC (MQTT detection)
# --------------------------------------------------------------
def on_detections_received(client, userdata, msg):
    
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        frame_id = payload.get("frame", 0)
        raw_detections = payload.get("bboxes", [])

        try:
            print(f"Received on {msg.topic}: {payload}")
        except Exception as e:
            print(f"✗ Error reading coral payload: {e}")
        
        # 1. Group detections by their class ID
        # e.g., all books go in one list, all cans go in another
        detections_by_class = {item_name: [] for item_name in CLASS_MAP.values()}
        
        
        for det in raw_detections:
            class_id = det.get("id")
            if class_id in CLASS_MAP:
                item_name = CLASS_MAP[class_id]
                x1 = det["xmin"] * 320
                y1 = det["ymin"] * 320
                x2 = det["xmax"] * 320
                y2 = det["ymax"] * 320
                score = det["score"]
                detections_by_class[item_name].append([x1, y1, x2, y2, score])
        
        # 2. Update trackers and count
        changes_this_frame = {}
        for item_name, boxes in detections_by_class.items():
            boxes_np = np.array(boxes) if len(boxes) > 0 else np.empty((0, 5))
            
            # Update the specific tracker for this item type
            tracked_objects = trackers[item_name].update(boxes_np)
            
            for track in tracked_objects:
                x1, y1, x2, y2, track_id = track
                track_id = int(track_id)
                centroid_x = int((x1 + x2) / 2)
                
                # Check if it crosses the zone
                if ZONE_X_MIN <= centroid_x <= ZONE_X_MAX:
                    if track_id not in counted_ids[item_name]:
                        # Increment local count
                        current_inventory[item_name] += 1
                        counted_ids[item_name].add(track_id)
                        
                        changes_this_frame[item_name] = current_inventory[item_name]
                            
                        print(f"\nCOUNT TRIGGERED! {item_name} (ID: {track_id}) crossed at X:{centroid_x}")
                            
                        # Optionally tell the robot we successfully logged it
                        client.publish("robot/inventory/ack", f"{item_name}_updated", 0)
        
        # Update Firebase if there were any changes in this frame
        if changes_this_frame:
            update_inventory(changes_this_frame)

    except json.JSONDecodeError:
        print(f"✗ Invalid JSON received")
    except Exception as e:
        print(f"✗ Error processing vision payload: {e}")



# --------------------------------------------------------------
# FIREBASE STATE LISTENER
# --------------------------------------------------------------
# this block triggers when a change happens in firebase
def on_robot_state_change(doc_snapshot, changes, read_time):
    # listens for status changes from robot
    for doc in doc_snapshot:
        # Look inside the data package (snapshot) that was pushed
        update = doc.to_dict().get('status')   
        print(f"Current State: {update}") # Print status to terminal

        # Publish new status via MQTT
        client.publish("robot/status", update, 0)



# --------------------------------------------------------------
# SETUP MQTT SUBSCRIPTIONS and MAIN LOOP
# --------------------------------------------------------------
# Subscribe to detections topic
client.subscribe("robot/coral")
client.on_message = on_detections_received

# Attach a permanent listener to "robot1", tells firebase to run function above when a change happens
doc_watch = db.collection("robots").document("robot1").on_snapshot(on_robot_state_change)

print("✓ Server initialised")
print("✓ Listening to Firebase robot status...")
print("✓ Listening to MQTT robot/item_counts...")

if __name__ == "__main__":
    # MAIN infinite loop 
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # Clean shutdown
        client.loop_stop()
        print("Bridge closed.")
        sys.exit(0)