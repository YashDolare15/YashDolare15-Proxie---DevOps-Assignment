// content.js
// Runs inside the hosted GitHub Pages tab.
// READ: page -> extension
// WRITE: extension -> page

const STATE_FORWARD_INTERVAL_MS = 50;
let lastForwardedState = 0;

// Receive live state from the hosted page.
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const data = event.data;

  if (!data || data.type !== "robot-state") return;

  const now = Date.now();

  // Forward at most about 20 state updates/second.
  if (now - lastForwardedState < STATE_FORWARD_INTERVAL_MS) {
    return;
  }

  lastForwardedState = now;

  chrome.runtime.sendMessage({
    type: "robot-state",
    x: Number(data.x ?? 0),
    z: Number(data.z ?? 0),
    rotationY: Number(data.rotationY ?? 0),
    timestamp: Date.now()
  });
});

// Receive commands from background.js and inject them into the page.
chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "robot-command") {
    return;
  }

  window.postMessage(
    {
      type: "robot-command",
      forward: Boolean(message.forward),
      back: Boolean(message.back),
      left: Boolean(message.left),
      right: Boolean(message.right),
      run: Boolean(message.run)
    },
    "*"
  );
});

// Tell the background service worker that this page is ready.
chrome.runtime.sendMessage({
  type: "page-ready"
});
