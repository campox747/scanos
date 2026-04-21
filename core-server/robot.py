import paho.mqtt.client as mqtt_client
import sys
import time
from lineFollowing import line_track, stop

# Initialize client (v2.0 standard)
client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION2)

# Define the "Connection" behavior
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Connected to Laptop Broker!")
        client.subscribe("robot/status") # Always subscribe here!
    else:
        print(f"Failed to connect, return code {rc}")

# Define the behavior
def on_message(client, userdata, msg):
    payload = msg.payload.decode("utf-8")
    print(f"Command received: {payload}")

    if payload == "running":
        print("Starting line tracking...")
        line_track() 
    elif payload == "idle":
        print("Stopping robot...")
        stop()

# Bind the functions to the client
client.on_connect = on_connect
client.on_message = on_message

# Connect and Start
try:
    client.connect("130.229.175.xx", 1883, 60)
    client.loop_start()
    
    # 6. Keep the script alive so the "ears" can stay open
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    stop()
    client.loop_stop()
    print("Robot script ended.")