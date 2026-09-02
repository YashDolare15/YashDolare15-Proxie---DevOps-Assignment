# Proxie DevOps Assignment — Python Browser Bridge

## 1. Project Overview

This project demonstrates real-time communication between a publicly hosted static robot web application and a local Python program.

The Chrome Extension acts as a bridge between the hosted webpage and the local Python WebSocket server.

Python can read the robot's live state and send movement commands to the robot.

## 2. Requirements

- Python 3.x
- Google Chrome
- Git
- Chrome Extension support — Developer Mode enabled to load the extension
- Python `websockets` package — required by `bridge.py`

## 3. Project Flow

### Step 1: Host the Static Website

- Push `index.html` to GitHub.
- Enable GitHub Pages.
- Open the publicly hosted robot webpage.
- Live hosted app: https://yashdolare15.github.io/YashDolare15-Proxie---DevOps-Assignment/
  
### Step 2: Create the Python Bridge

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

```bash
.\venv\Scripts\Activate.ps1
```

Install the dependency:

```bash
pip install websockets
```

Use `bridge.py` to run the local WebSocket server.

### Step 3: Create the Chrome Extension

- Create the Chrome Extension using `manifest.json`, `content.js`, and `background.js`.
- Open:

```bash
chrome://extensions/
```

- Enable Developer Mode.
- Click **Load unpacked**.
- Select the extension folder.

### Step 4: Connect Python with Chrome

Run the Python bridge:

```bash
python python\bridge.py
```

The Python bridge listens on:

```
ws://127.0.0.1:8765
```

Open the hosted robot webpage in Chrome. The Chrome Extension connects the hosted webpage with the local Python bridge.

### Step 5: Read Robot State

The hosted webpage sends the robot's:

- X position
- Z position
- Rotation

The Extension forwards this data to Python in real time.

### Step 6: Send Robot Commands

Python generates commands such as:

`FORWARD`, `LEFT`, `RIGHT`, `RUN`, `STOP`

The Extension forwards these commands to the hosted webpage, causing the robot to move automatically.

## 5. Files and Their Purpose

| File | Purpose |
|---|---|
| `index.html` | Contains the robot web application hosted on GitHub Pages. |
| `bridge.py` | Runs the local Python WebSocket server to receive robot state and send movement commands. |
| `requirements.txt` | Lists the Python dependencies required for the bridge, such as `websockets`. |
| `manifest.json` | Defines the Chrome Extension, its permissions, scripts, and accessible webpages. |
| `content.js` | Runs inside the webpage to receive robot state and forward robot commands. |
| `background.js` | Maintains the WebSocket connection with Python and routes messages between Python and `content.js`. |

### Why We Chose This Mechanism

We chose a Chrome Extension + WebSocket because it provides real-time, two-way communication between the hosted webpage and the local Python program without requiring a backend server.

The Chrome Extension handles communication with the webpage, while WebSocket connects the extension to Python. This approach is simple, lightweight, and suitable for continuous robot state updates and movement commands.

The main trade-offs are that the Chrome Extension requires browser permissions and the local Python bridge must be running during the demo.


### Trade-offs

* **Latency:** WebSocket provides low-latency, real-time communication.
* **Security:** The bridge is restricted to `127.0.0.1`.
* **Permissions:** Chrome Extension requires webpage access permissions.
* **Setup:** Requires loading the extension and running the local Python bridge.

