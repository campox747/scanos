import firebase_admin
from firebase_admin import credentials, firestore
import time

cred = credentials.Certificate("serviceAccountKey.json") # grab private key
firebase_admin.initialize_app(cred) # init firebase using key
db = firestore.client()

# this block triggers when a change happens in firebase
def on_robot_state_change(doc_snapshot, changes, read_time):
    for doc in doc_snapshot: # look inside the data package (snapshot) that was pushed
        print(f"State changed: {doc.to_dict().get('status')}") # print status to terminal

# attach a permanent listener to "robot1", tells firebase to run function above when a change happens
doc_watch = db.collection("robots").document("robot1").on_snapshot(on_robot_state_change)

print("Listening to Firebase...")
# infinite loop with sleep 
while True:
    time.sleep(1)