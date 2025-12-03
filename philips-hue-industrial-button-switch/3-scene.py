from machine import Pin
import time
import network
import urequests
import ujson
import gc

ssid = ""
password = ""
bridge_ip = ""
user = ""
group_id = "82"
scene_id = ""

def connect_wifi():
    w = network.WLAN(network.STA_IF)
    w.active(True)
    w.connect(ssid, password)
    attempts = 0
    while not w.isconnected() and attempts < 20:
        time.sleep(1)
        attempts += 1
    if w.isconnected():
        print("wifi:", w.ifconfig())
    else:
        print("wifi: connection failed")
    return w

def ensure_wifi(w):
    if not w.isconnected():
        print("wifi: reconnecting...")
        w.connect(ssid, password)
        attempts = 0
        # Eerste 10 pogingen: elke 2 seconden
        while not w.isconnected() and attempts < 10:
            time.sleep(2)
            attempts += 1
        # Daarna: blijf proberen elke 30 seconden
        while not w.isconnected():
            print("wifi: still trying...")
            w.connect(ssid, password)
            time.sleep(30)
        print("wifi: reconnected")

def scene_on():
    try:
        url = "http://%s/api/%s/groups/%s/action" % (bridge_ip, user, group_id)
        payload = ujson.dumps({"scene": scene_id})
        r = urequests.put(url, data=payload, timeout=5)
        print("scene:", r.text)
        r.close()
    except Exception as e:
        print("scene error:", e)
    gc.collect()

def group_off():
    try:
        url = "http://%s/api/%s/groups/%s/action" % (bridge_ip, user, group_id)
        payload = ujson.dumps({"on": False})
        r = urequests.put(url, data=payload, timeout=5)
        print("off:", r.text)
        r.close()
    except Exception as e:
        print("off error:", e)
    gc.collect()

w = connect_wifi()

k1 = Pin(18, Pin.IN, Pin.PULL_UP)
k2 = Pin(19, Pin.IN, Pin.PULL_UP)

l1 = k1.value()
l2 = k2.value()

while True:
    ensure_wifi(w)

    v1 = k1.value()
    v2 = k2.value()

    if v1 != l1:
        if v1 == 0:
            print("knop 1")
            group_off()
        l1 = v1

    if v2 != l2:
        if v2 == 0:
            print("knop 2")
            scene_on()
        l2 = v2

    time.sleep(0.02)
