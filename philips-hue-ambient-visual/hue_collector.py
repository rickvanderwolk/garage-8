"""Collects data from Philips Hue Bridge."""

import json
import os
from dataclasses import dataclass, asdict
from typing import Optional
import requests


@dataclass
class LampState:
    """State of a single lamp."""
    light_id: int
    name: str
    on: bool
    brightness: int  # 0-254
    hue: Optional[int]  # 0-65535
    saturation: Optional[int]  # 0-254
    reachable: bool
    model_id: str = ""
    light_type: str = ""

    def to_dict(self):
        return asdict(self)


@dataclass
class SensorState:
    """State of a sensor."""
    sensor_id: int
    name: str
    sensor_type: str
    presence: Optional[bool] = None
    light_level: Optional[int] = None
    temperature: Optional[int] = None
    battery: Optional[int] = None

    def to_dict(self):
        return asdict(self)


class HueCollector:
    """Collects lamp and sensor data from Hue Bridge."""

    def __init__(self, bridge_ip: str, username: str):
        self.bridge_ip = bridge_ip
        self.username = username
        self.base_url = f"http://{bridge_ip}/api/{username}"

    @classmethod
    def auto_connect(cls) -> Optional["HueCollector"]:
        """Auto-discover bridge and load credentials."""
        config_path = os.path.expanduser("~/.hue_credentials.json")

        if os.path.exists(config_path):
            with open(config_path) as f:
                creds = json.load(f)
                return cls(creds["bridge_ip"], creds["username"])

        # Try to discover bridge
        try:
            response = requests.get("https://discovery.meethue.com", timeout=5)
            bridges = response.json()
            if bridges:
                bridge_ip = bridges[0]["internalipaddress"]
                print(f"Found bridge at {bridge_ip}")
                print("Please create credentials first (run with --setup)")
                return None
        except Exception as e:
            print(f"Discovery failed: {e}")

        return None

    def connect(self):
        """Test connection to bridge."""
        try:
            response = requests.get(f"{self.base_url}/lights", timeout=2)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False

    def get_all(self) -> tuple[list["LampState"], list["SensorState"]]:
        """Get all lights and sensors in one call (faster)."""
        try:
            # Single API call gets everything
            response = requests.get(self.base_url, timeout=1)
            data = response.json()

            lamps = []
            lights_data = data.get("lights", {})
            for light_id, light_data in lights_data.items():
                state = light_data.get("state", {})
                lamps.append(LampState(
                    light_id=int(light_id),
                    name=light_data.get("name", f"Light {light_id}"),
                    on=state.get("on", False),
                    brightness=state.get("bri", 0),
                    hue=state.get("hue"),
                    saturation=state.get("sat"),
                    reachable=state.get("reachable", False),
                    model_id=light_data.get("modelid", ""),
                    light_type=light_data.get("type", ""),
                ))

            sensors = []
            sensors_data = data.get("sensors", {})
            for sensor_id, sensor_data in sensors_data.items():
                state = sensor_data.get("state", {})
                config = sensor_data.get("config", {})
                sensors.append(SensorState(
                    sensor_id=int(sensor_id),
                    name=sensor_data.get("name", f"Sensor {sensor_id}"),
                    sensor_type=sensor_data.get("type", ""),
                    presence=state.get("presence"),
                    light_level=state.get("lightlevel"),
                    temperature=state.get("temperature"),
                    battery=config.get("battery"),
                ))

            return sorted(lamps, key=lambda l: l.light_id), sensors
        except Exception as e:
            print(f"Failed to get data: {e}")
            return [], []

    def get_all_lights(self) -> list[LampState]:
        """Get state of all lights."""
        lamps, _ = self.get_all()
        return lamps

    def get_all_sensors(self) -> list[SensorState]:
        """Get state of all sensors."""
        _, sensors = self.get_all()
        return sensors


class MockHueCollector:
    """Mock collector for testing without a Hue Bridge."""

    def __init__(self):
        self.bridge_ip = "mock"
        self._tick = 0

    def connect(self):
        return True

    def get_all(self) -> tuple[list[LampState], list[SensorState]]:
        import math
        import random
        self._tick += 1

        # Generate some dynamic mock data
        lamps = []
        for i in range(4):
            hue = int((self._tick * 100 + i * 16000) % 65535)
            brightness = int(127 + 127 * math.sin(self._tick * 0.1 + i))

            lamps.append(LampState(
                light_id=i + 1,
                name=f"Mock Lamp {i + 1}",
                on=True,
                brightness=brightness,
                hue=hue,
                saturation=254,
                reachable=True,
                model_id="LCT007",
                light_type="Extended color light",
            ))

        sensors = [
            SensorState(
                sensor_id=1,
                name="Mock Motion",
                sensor_type="ZLLPresence",
                presence=random.random() > 0.9,
                battery=85,
            ),
            SensorState(
                sensor_id=2,
                name="Mock Light",
                sensor_type="ZLLLightLevel",
                light_level=20000,
            ),
            SensorState(
                sensor_id=3,
                name="Mock Temp",
                sensor_type="ZLLTemperature",
                temperature=2100,
            ),
        ]

        return lamps, sensors
