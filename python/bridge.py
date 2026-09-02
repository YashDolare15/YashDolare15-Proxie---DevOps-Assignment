import asyncio
import json
import websockets

HOST = "127.0.0.1"
PORT = 8765

connected_clients = set()

COMMANDS = {
    "forward": {
        "forward": True,
        "back": False,
        "left": False,
        "right": False,
        "run": False
    },
    "back": {
        "forward": False,
        "back": True,
        "left": False,
        "right": False,
        "run": False
    },
    "left": {
        "forward": False,
        "back": False,
        "left": True,
        "right": False,
        "run": False
    },
    "right": {
        "forward": False,
        "back": False,
        "left": False,
        "right": True,
        "run": False
    },
    "run": {
        "forward": True,
        "back": False,
        "left": False,
        "right": False,
        "run": True
    },
    "stop": {
        "forward": False,
        "back": False,
        "left": False,
        "right": False,
        "run": False
    }
}

last_state = None

async def handle_client(websocket):
    global last_state

    connected_clients.add(websocket)

    print("\n[+] Chrome extension connected")

    try:
        async for message in websocket:
            try:
                data = json.loads(message)

            except json.JSONDecodeError:
                print("[!] Invalid JSON received")
                continue

            if data.get("type") == "page-ready":
                print("[READ] Hosted robot page is ready")

            elif data.get("type") == "robot-state":
                x = float(data.get("x", 0))
                z = float(data.get("z", 0))
                rotation = float(data.get("rotationY", 0))

                current_state = (
                    round(x, 2),
                    round(z, 2),
                    round(rotation, 2)
                )

                if current_state != last_state:
                    print(
                        f"[READ] "
                        f"X: {x:8.2f} | "
                        f"Z: {z:8.2f} | "
                        f"Rotation: {rotation:7.2f}"
                    )

                    last_state = current_state

    except websockets.exceptions.ConnectionClosed:
        pass

    finally:
        connected_clients.discard(websocket)
        print("\n[-] Chrome extension disconnected")


async def send_command(command_name):
    if not connected_clients:
        print(
            f"\n[!] Cannot send '{command_name}'. "
            "Chrome extension is not connected."
        )
        return

    command = COMMANDS[command_name]

    message = json.dumps({
        "type": "robot-command",
        **command
    })

    for client in connected_clients:
        try:
            await client.send(message)

        except websockets.exceptions.ConnectionClosed:
            pass

    print(f"\n[WRITE] Python -> Robot: {command_name.upper()}")


async def robot_script():
    # Add your robot movement commands here.
    print("\n[TEST] Starting robot script...")

    await send_command("forward")
    await asyncio.sleep(2)

    await send_command("stop")
    await asyncio.sleep(0.5)

    await send_command("left")
    await asyncio.sleep(1)

    await send_command("stop")
    await asyncio.sleep(0.5)

    await send_command("forward")
    await asyncio.sleep(2)

    await send_command("stop")

    print("\n[TEST] Robot script completed.")


async def wait_for_connection():
    print("[TEST] Waiting for Chrome extension...")

    while not connected_clients:
        await asyncio.sleep(0.2)

    print("[TEST] Chrome extension connected.")


async def main():
    print("Starting Proxie Python WebSocket bridge...")
    print(f"Listening on ws://{HOST}:{PORT}")

    server = await websockets.serve(
        handle_client,
        HOST,
        PORT
    )

    try:
        await wait_for_connection()
        await robot_script()
        print("\n[READ] Continuing live state monitoring...")
        await asyncio.Future()

    finally:
        server.close()
        await server.wait_closed()


if __name__ == "__main__":
    try:
        asyncio.run(main())

    except KeyboardInterrupt:
        print("\nBridge stopped.")