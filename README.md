# ScanOS

**ScanOS** is an autonomous warehouse inventory system that combines robotics, edge computer vision, real-time messaging, and a web dashboard to detect, track, and count inventory items.

The system was built around an **XRP robot** and **Coral Dev Board**. As the robot follows a warehouse route, object detections are sent to a Python server, tracked with **SORT**, and synchronized with **Firebase/Firestore**. A React dashboard provides live inventory data and robot controls.

## How it works

1. The XRP robot navigates along a predefined line using reflectance sensors and PID-based line following.
2. A Coral Dev Board performs object detection and sends bounding-box data to the robot over UART.
3. The robot forwards detections to the core server through MQTT.
4. The server filters and merges detections, then uses SORT multi-object tracking to assign persistent IDs and avoid duplicate counts.
5. Objects crossing the counting zone update the inventory stored in Firestore.
6. The React dashboard listens to Firestore in real time and allows the user to start/stop inventory rounds, return the robot home, and interact with the inventory.

## Architecture

```text
Coral Dev Board
      |
     UART
      v
   XRP Robot <-------- MQTT --------> Python Core Server
      ^                                      |
      |                                      |
 Robot commands                         Firestore
                                             |
                                             v
                                      React Dashboard
```

## Features

- Autonomous PID-based line following
- Edge object detection with Coral hardware
- SORT multi-object tracking
- Confidence filtering and fragmented bounding-box merging
- Duplicate-count prevention using persistent tracking IDs
- MQTT communication between robot and server
- Real-time inventory synchronization with Firebase/Firestore
- React control panel with live robot status and inventory data
- Start, emergency-stop, and return-home controls
- Item search workflow

## Results

During final testing, ScanOS recognized an average of **12 out of 13 objects across three runs**, corresponding to a **92% recognition rate**.

## Tech Stack

- **Robot:** XRP Robot, MicroPython, XRPLib
- **Computer Vision:** Coral Dev Board, OpenCV, SORT
- **Backend:** Python, NumPy, Paho MQTT
- **Messaging:** MQTT / Mosquitto
- **Database:** Firebase Firestore
- **Frontend:** React, Vite, Tailwind CSS

## Repository Structure

```text
scanos/
├── core-server/       # MQTT/Firebase bridge, tracking and inventory logic
│   ├── server.py
│   └── sort.py
├── robot-code/        # XRP navigation, MQTT client and Coral UART bridge
│   ├── main.py
│   └── lineFollowing.py
├── my-app/            # React inventory dashboard and robot controls
└── firebase/          # Firebase project configuration
```

## Running the Project

The project requires an XRP robot, Coral Dev Board, MQTT broker, and Firebase project configured for the local environment.

### Core server

```bash
cd core-server
pip install -r requirements.txt
python server.py
```

A Firebase service-account key must be available to the server as `serviceAccountKey.json`, and the MQTT broker address must match the local deployment.

### Dashboard

```bash
cd my-app
npm install
npm run dev
```

### Robot

Deploy the files in `robot-code/` to the XRP controller after configuring the local Wi-Fi and MQTT broker settings.

## Authors

Developed as a collaborative robotics and software engineering project.
