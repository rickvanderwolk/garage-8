#!/usr/bin/env python3
"""Server for Philips Hue Ambient Visuals."""

import argparse
import threading
import time
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO

from hue_collector import HueCollector, MockHueCollector
from config import HOST, PORT, POLL_INTERVAL

app = Flask(__name__, static_folder="static", template_folder="static")
socketio = SocketIO(app, cors_allowed_origins="*")

# Global state
collector = None
current_state = {
    "lamps": [],
    "sensors": [],
}


def hue_to_rgb(hue: int, sat: int, bri: int) -> tuple[int, int, int]:
    """Convert Hue color values to RGB."""
    if hue is None or sat is None:
        # White light
        v = int(bri / 254 * 255)
        return (v, v, v)

    # Convert to 0-1 range
    h = hue / 65535
    s = sat / 254
    v = bri / 254

    if s == 0:
        v = int(v * 255)
        return (v, v, v)

    i = int(h * 6)
    f = (h * 6) - i
    p = v * (1 - s)
    q = v * (1 - s * f)
    t = v * (1 - s * (1 - f))

    i = i % 6
    if i == 0:
        r, g, b = v, t, p
    elif i == 1:
        r, g, b = q, v, p
    elif i == 2:
        r, g, b = p, v, t
    elif i == 3:
        r, g, b = p, q, v
    elif i == 4:
        r, g, b = t, p, v
    else:
        r, g, b = v, p, q

    return (int(r * 255), int(g * 255), int(b * 255))


def poll_hue():
    """Background thread to poll Hue Bridge."""
    global current_state

    while True:
        try:
            # Single API call for speed
            lamps, sensors = collector.get_all()

            # Convert to visual-friendly format
            lamp_data = []
            for lamp in lamps:
                if lamp.on and lamp.reachable:
                    # Smart plugs/devices without color get a warm orange glow
                    if lamp.hue is None and lamp.saturation is None:
                        hue = 8000  # Warm orange
                        sat = 200
                        bri = lamp.brightness if lamp.brightness > 0 else 200
                    else:
                        hue = lamp.hue or 0
                        sat = lamp.saturation or 0
                        bri = lamp.brightness

                    r, g, b = hue_to_rgb(hue, sat, bri)
                    lamp_data.append({
                        "id": lamp.light_id,
                        "name": lamp.name,
                        "r": r,
                        "g": g,
                        "b": b,
                        "brightness": bri / 254,
                        "hue": hue,
                        "saturation": sat / 254,
                    })

            sensor_data = []
            motion_triggered = []
            light_levels = []
            temperatures = []

            for sensor in sensors:
                sensor_data.append(sensor.to_dict())

                # Track motion triggers
                if sensor.presence is not None:
                    sensor_key = f"motion_{sensor.sensor_id}"
                    was_present = current_state.get("_prev_motion", {}).get(sensor_key, False)
                    if sensor.presence and not was_present:
                        motion_triggered.append({
                            "name": sensor.name,
                            "id": sensor.sensor_id
                        })
                    current_state.setdefault("_prev_motion", {})[sensor_key] = sensor.presence

                # Collect light levels
                if sensor.light_level is not None:
                    light_levels.append(sensor.light_level)

                # Collect temperatures
                if sensor.temperature is not None:
                    temperatures.append(sensor.temperature)

            # Calculate environment values
            avg_light = sum(light_levels) / len(light_levels) if light_levels else 10000
            avg_temp = sum(temperatures) / len(temperatures) if temperatures else 2000
            max_light = max(light_levels) if light_levels else 10000

            # Normalize values for frontend
            # Light level: 0-65535 log scale, typical indoor ~10000-20000
            light_normalized = min(1.0, max(0.0, avg_light / 30000))
            # Temperature: in 0.01°C, typical 15-25°C = 1500-2500
            temp_normalized = min(1.0, max(0.0, (avg_temp - 1500) / 1000))

            current_state = {
                "lamps": lamp_data,
                "sensors": sensor_data,
                "environment": {
                    "light_level": light_normalized,
                    "temperature": temp_normalized,
                    "avg_light_raw": avg_light,
                    "avg_temp_raw": avg_temp / 100,  # Convert to Celsius
                    "motion_triggered": motion_triggered,
                    "any_motion": any(s.presence for s in sensors if s.presence is not None),
                },
                "_prev_motion": current_state.get("_prev_motion", {}),
            }

            # Emit to all connected clients
            socketio.emit("state", current_state)

        except Exception as e:
            print(f"Poll error: {e}")

        time.sleep(POLL_INTERVAL)


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/state")
def api_state():
    return jsonify(current_state)


@socketio.on("connect")
def handle_connect():
    print("Client connected")
    socketio.emit("state", current_state)


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


def setup_bridge():
    """Setup Hue Bridge credentials."""
    import json
    import os
    import requests

    print("Searching for Hue Bridge...")
    try:
        response = requests.get("https://discovery.meethue.com", timeout=5)
        bridges = response.json()
        if not bridges:
            print("No bridge found on network")
            return False
        bridge_ip = bridges[0]["internalipaddress"]
        print(f"Found bridge at {bridge_ip}")
    except Exception as e:
        print(f"Discovery failed: {e}")
        return False

    print("\n>>> Press the link button on your Hue Bridge NOW!")
    print("Trying to connect (30 seconds)...")

    for attempt in range(30):
        try:
            response = requests.post(
                f"http://{bridge_ip}/api",
                json={"devicetype": "hue-ambient-visuals#python"},
                timeout=5
            )
            result = response.json()

            if isinstance(result, list) and "success" in result[0]:
                username = result[0]["success"]["username"]
                config_path = os.path.expanduser("~/.hue_credentials.json")
                with open(config_path, "w") as f:
                    json.dump({"bridge_ip": bridge_ip, "username": username}, f)
                print(f"\nSuccess! Credentials saved to {config_path}")
                print("You can now run the server without --mock")
                return True
            elif isinstance(result, list) and "error" in result[0]:
                error_type = result[0]["error"].get("type")
                if error_type == 101:
                    # Link button not pressed yet
                    print(".", end="", flush=True)
                    time.sleep(1)
                    continue
                else:
                    print(f"\nFailed: {result}")
                    return False
        except Exception as e:
            print(f"\nError: {e}")
            return False

    print("\nTimeout - link button was not pressed in time")
    return False


def main():
    global collector

    parser = argparse.ArgumentParser(description="Philips Hue Ambient Visuals Server")
    parser.add_argument("--mock", action="store_true", help="Use mock data")
    parser.add_argument("--setup", action="store_true", help="Setup Hue Bridge credentials")
    args = parser.parse_args()

    if args.setup:
        setup_bridge()
        return

    if args.mock:
        collector = MockHueCollector()
        print("Running in mock mode")
    else:
        collector = HueCollector.auto_connect()
        if collector is None:
            print("Could not connect to Hue Bridge. Use --mock for demo.")
            return

    if not collector.connect():
        print("Failed to connect to Hue Bridge")
        return

    # Start background polling thread
    poll_thread = threading.Thread(target=poll_hue, daemon=True)
    poll_thread.start()

    print(f"Starting server at http://{HOST}:{PORT}")
    socketio.run(app, host=HOST, port=PORT, debug=False)


if __name__ == "__main__":
    main()
