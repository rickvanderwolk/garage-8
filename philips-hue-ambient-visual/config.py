"""Configuration for Philips Hue Ambient Visuals."""

# Hue Bridge settings
BRIDGE_IP = None  # Auto-discover if None
POLL_INTERVAL = 0.3  # Seconds between Hue Bridge polls

# Server settings
HOST = "0.0.0.0"
PORT = 5555

# Visual settings
CANVAS_WIDTH = 1920
CANVAS_HEIGHT = 1080
FRAME_RATE = 60
