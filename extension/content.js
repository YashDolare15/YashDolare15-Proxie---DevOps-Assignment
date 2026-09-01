(() => {

    console.log(
        "[Proxie Bridge] Content script loaded."
    );


    // Robot webpage → Chrome extension

    window.addEventListener(
        "message",
        (event) => {

            if (event.source !== window) {
                return;
            }

            const data = event.data;

            if (!data) {
                return;
            }

            if (data.type === "robot-state") {

                console.log(
                    "[Proxie Bridge] Robot state received:",
                    data
                );

                chrome.runtime.sendMessage({

                    type: "robot-state",

                    x: data.x,
                    z: data.z,
                    rotationY: data.rotationY

                });

            }

        }
    );


    // Chrome extension → Robot webpage

    chrome.runtime.onMessage.addListener(
        (message) => {

            if (!message) {
                return;
            }

            if (
                message.type ===
                "robot-command"
            ) {

                console.log(
                    "[Proxie Bridge] Robot command received:",
                    message
                );

                window.postMessage(
                    {
                        type: "robot-command",

                        forward:
                            Boolean(message.forward),

                        back:
                            Boolean(message.back),

                        left:
                            Boolean(message.left),

                        right:
                            Boolean(message.right),

                        run:
                            Boolean(message.run)
                    },
                    "*"
                );

            }

        }
    );

})();