let socket = null;
let reconnectTimer = null;

const PYTHON_WS_URL =
    "ws://127.0.0.1:8765";


function connectToPython() {

    if (
        socket &&
        (
            socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING
        )
    ) {
        return;
    }

    console.log(
        "[Proxie Bridge] Connecting to Python..."
    );

    socket = new WebSocket(
        PYTHON_WS_URL
    );


    socket.addEventListener(
        "open",
        () => {

            console.log(
                "[Proxie Bridge] Connected to Python"
            );

        }
    );


    socket.addEventListener(
        "message",
        (event) => {

            try {

                const data =
                    JSON.parse(event.data);

                console.log(
                    "[Proxie Bridge] Python -> Extension:",
                    data
                );


                if (
                    data.type ===
                    "robot-command"
                ) {

                    chrome.tabs.query(
                        {},
                        (tabs) => {

                            for (
                                const tab
                                of tabs
                            ) {

                                if (!tab.id) {
                                    continue;
                                }

                                chrome.tabs.sendMessage(
                                    tab.id,
                                    data
                                ).catch(
                                    () => {}
                                );

                            }

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "[Proxie Bridge] Invalid message:",
                    error
                );

            }

        }
    );


    socket.addEventListener(
        "close",
        () => {

            console.log(
                "[Proxie Bridge] Python disconnected."
            );

            reconnect();

        }
    );


    socket.addEventListener(
        "error",
        (error) => {

            console.error(
                "[Proxie Bridge] WebSocket error:",
                error
            );

        }
    );
}


function reconnect() {

    if (reconnectTimer !== null) {
        return;
    }

    reconnectTimer = setTimeout(
        () => {

            reconnectTimer = null;

            connectToPython();

        },
        2000
    );
}


chrome.runtime.onMessage.addListener(
    (message) => {

        if (!message) {
            return;
        }


        if (
            message.type ===
            "robot-state"
        ) {

            if (
                socket &&
                socket.readyState ===
                WebSocket.OPEN
            ) {

                socket.send(
                    JSON.stringify({

                        type:
                            "robot-state",

                        x:
                            message.x,

                        z:
                            message.z,

                        rotationY:
                            message.rotationY

                    })
                );

            }

        }

    }
);


connectToPython();