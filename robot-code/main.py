import network
import time
from simple import MQTTClient
from lineFollowing import LineFollower
import uasyncio as asyncio
from machine import UART, Pin

lf = LineFollower()	

# Initialize Coral Board connection
coral_uart = UART(0, baudrate=115200, tx=Pin(0), rx=Pin(1))

# Wi-Fi Connection
WIFI_SSID = "iPhone 383"
WIFI_PASSWORD = "ManuXDDX"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(WIFI_SSID, WIFI_PASSWORD)

print("Connecting to Wi-Fi...")
while not wlan.isconnected():
    time.sleep(1)
print(f"Connected! Robot IP: {wlan.ifconfig()[0]}")

# MQTT Configuration
MQTT_BROKER = "172.20.10.3"
CLIENT_ID = "XRP_Robot_01"
TOPIC_SUB = b"robot/status"  


# The "Reaction" (Callback)
def sub_cb(topic, msg):
    #print((topic, msg))
    command = msg.decode('utf-8')
    print(f"Received: {command}")
    
    if command == "running":
        print(f"RUNNING NOW")
        lf.start()
    elif command == "idle":
        lf.stop()
    elif command == "returning":
        lf.return_home()
        client.publish(b"robot/status", b"idle")        

# Initialize and Connect
client = MQTTClient(CLIENT_ID, MQTT_BROKER)
client.set_callback(sub_cb)
connected = False
while not connected:
    try: 
        client.connect()
        connected = True
    except Exception as f:
        print(f"Connect failed error: {f}")

client.subscribe(TOPIC_SUB)
print(f"Connected to Broker at {MQTT_BROKER} and subscribed.")


# Read coral data ç
async def read_coral_data():
    while True:
        if coral_uart.any():

            raw_data = coral_uart.readline()
            
            if raw_data:
                try:
                    text_data = raw_data.decode('utf-8').strip()
                    print(f"Coral sees: {text_data}")
                    
                    # Send this data to the server via MQTT
                    client.publish(b"robot/coral", text_data)
                except Exception as e:
                    pass # Ignore decoding errors
        await asyncio.sleep(0.1)
        
async def handle_server_commands():
    while True:
        try:
            client.check_msg() 
        except OSError:
            print("MQTT Error")
            
        # Give the other task a turn to run for 50ms
        await asyncio.sleep(0.05)
        
async def drive_motors():
    while True:
        # Assuming lf.start() sets lf.following to True based on your old code
        if lf.following:
            lf.line_track()  # Read sensors and adjust motor speeds
            
        # 0.02 seconds = 20ms. 
        await asyncio.sleep(0.02)

async def main():
    print("Starting concurrent tasks...")
    
    # Fire up both tasks
    asyncio.create_task(read_coral_data())
    asyncio.create_task(handle_server_commands())
    asyncio.create_task(drive_motors())
    
    # Keep the main program alive infinitely
    while True:
        await asyncio.sleep(1)

# Start the asyncio event loop
try:
    asyncio.run(main())
except KeyboardInterrupt:
    print("Program stopped.")

