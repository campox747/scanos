import firebase_admin
from firebase_admin import credentials, firestore
import time
from paho.mqtt import client as mqtt_client
import sys
import json

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

# updates firebase inventory with item counts from robot

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
# MQTT CALLBACK - recieves item counts from robot
# --------------------------------------------------------------
def on_item_count_received(client, userdata, msg):
    
    # Triggered when robot publishes item counts via MQTT.
    # Expected message format: {"item_1": 5, "widget_A": 12, ...}
    
    try:
        payload = msg.payload.decode('utf-8')
        item_counts = json.loads(payload)
        
        print(f"\n Received item counts from robot: {item_counts}")
        
        # Update Firebase inventory
        if update_inventory(item_counts):
            # Optionally publish success confirmation back to robot
            client.publish("robot/inventory/ack", "inventory_updated", 0)
        else:
            client.publish("robot/inventory/ack", "update_failed", 0)
    
    except json.JSONDecodeError:
        print(f"✗ Invalid JSON received: {msg.payload}")
    except Exception as e:
        print(f"✗ Error processing item counts: {e}")



# this block triggers when a change happens in firebase
def on_robot_state_change(doc_snapshot, changes, read_time):
    for doc in doc_snapshot:
        # Look inside the data package (snapshot) that was pushed
        update = doc.to_dict().get('status')   
        print(f"Current State: {update}") # Print status to terminal

        # Publish new status via MQTT
        client.publish("robot/status", update, 0)



# --------------------------------------------------------------
# SETUP MQTT SUBSCRIPTIONS
# --------------------------------------------------------------
# Subscribe to item counts topic
client.subscribe("robot/item_counts")
client.on_message = on_item_count_received

# Attach a permanent listener to "robot1", tells firebase to run function above when a change happens
doc_watch = db.collection("robots").document("robot1").on_snapshot(on_robot_state_change)

print("✓ Server initialised")
print("✓ Listening to Firebase robot status...")
print("✓ Listening to MQTT robot/item_counts...")

# Infinite loop 
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    # Clean shutdown
    client.loop_stop()
    print("Bridge closed.")
    sys.exit(0)