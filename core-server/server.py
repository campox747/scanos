import firebase_admin
from firebase_admin import credentials, firestore
import time
from paho.mqtt import client as mqtt_client
import sys

# Initialize client
client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION2)

# Establish connection to broker (mosquitto)
if client.connect("localhost", 1883, 60) != 0:
    print("Couldn't connect to broker")
    sys.exit

client.loop_start()

# Grab private key
cred = credentials.Certificate("serviceAccountKey.json") 
firebase_admin.initialize_app(cred) # Init firebase
db = firestore.client()

# this block triggers when a change happens in firebase
def on_robot_state_change(doc_snapshot, changes, read_time):
    for doc in doc_snapshot:

         # Look inside the data package (snapshot) that was pushed
        update = doc.to_dict().get('status')   
        print(f"Current State: {update}") # Print status to terminal

        # Publish new status via MQTT
        client.publish("robot/status", update, 0)


# Attach a permanent listener to "robot1", tells firebase to run function above when a change happens
doc_watch = db.collection("robots").document("robot1").on_snapshot(on_robot_state_change)

print("Listening to Firebase...")

# Infinite loop 
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    # Clean shutdown
    client.loop_stop()
    print("Bridge closed.")