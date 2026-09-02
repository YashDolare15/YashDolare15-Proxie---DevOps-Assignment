// background.js
// WebSocket bridge between the hosted page and local Python.
//
// Hosted page -> content.js -> this service worker -> Python
// Python -> this service worker -> content.js -> hosted page

const PYTHON_WS_URL = "ws://127.0.0.1:8765";

let socket = null;
let reconnectTimer = null;
let activeTabId = null;

function connectToPython() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
     socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  try {
    socket = new WebSocket(PYTHON_WS_URL);

    socket.addEventListener("open", () => {
      console.log("[Bridge] Connected to local Python.");
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type !== "robot-command") {
          return;
        }

        if (activeTabId === null) {
          console.warn("[Bridge] No active robot tab.");
          return;
        }

        chrome.tabs.sendMessage(
          activeTabId,
          data
        ).catch(() => {
          // The tab may have navigated or closed.
        });

      } catch (error) {
        console.error("[Bridge] Invalid message from Python:", error);
      }
    });

    socket.addEventListener("close", () => {
      console.log("[Bridge] Python disconnected.");
      socket = null;
      scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      console.warn("[Bridge] WebSocket connection error.");
    });

  } catch (error) {
    console.error("[Bridge] Could not create WebSocket:", error);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer !== null) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToPython();
  }, 1000);
}

function sendToPython(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message) return;

  if (sender.tab && sender.tab.id !== undefined) {
    activeTabId = sender.tab.id;
  }

  if (message.type === "page-ready") {
    connectToPython();

    sendToPython({
      type: "page-ready"
    });

    return;
  }

  if (message.type === "robot-state") {
    sendToPython({
      type: "robot-state",
      x: Number(message.x ?? 0),
      z: Number(message.z ?? 0),
      rotationY: Number(message.rotationY ?? 0),
      timestamp: Number(message.timestamp ?? Date.now())
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    activeTabId = null;
  }
});

connectToPython();
