from machine import Pin
import time
import network
import urequests
import ujson

ssid = "YOUR_WIFI_SSID"
password = "YOUR_WIFI_PASSWORD"
bridge_ip = "YOUR_HUE_BRIDGE_IP"
user = "YOUR_HUE_API_KEY"
light_id = 1 # YOUR HUE LIGHT ID

def turn_light_on():
    url = f"http://{bridge_ip}/api/{user}/lights/{light_id}/state"
    payload = ujson.dumps({"on": True})
    try:
        r = urequests.put(url, data=payload)
        print("Light ON:", r.text)
        r.close()
    except Exception as e:
        print("Error turning light on:", e)

def turn_light_off():
    url = f"http://{bridge_ip}/api/{user}/lights/{light_id}/state"
    payload = ujson.dumps({"on": False})
    try:
        r = urequests.put(url, data=payload)
        print("Light OFF:", r.text)
        r.close()
    except Exception as e:
        print("Error turning light off:", e)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
print("Connecting to WiFi...")
while not wlan.isconnected():
    time.sleep(0.5)
print("Connected:", wlan.ifconfig())

flame = Pin(13, Pin.IN)
last_state = flame.value()

while True:
    current = flame.value()
    if current != last_state:
        if current == 0:
            print("🔥 Flame detected!")
            turn_light_on()
        else:
            print("— No flame")
            turn_light_off()
        last_state = current
    time.sleep(0.1)
