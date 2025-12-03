from machine import Pin
import time
import network
import urequests
import ujson

ssid = ""
password = ""
bridge_ip = ""
user = ""
light_id = 42

def light_on():
    url = "http://%s/api/%s/lights/%s/state" % (bridge_ip, user, light_id)
    payload = ujson.dumps({"on": True})
    r = urequests.put(url, data=payload)
    print("on:", r.text)
    r.close()

def light_off():
    url = "http://%s/api/%s/lights/%s/state" % (bridge_ip, user, light_id)
    payload = ujson.dumps({"on": False})
    r = urequests.put(url, data=payload)
    print("off:", r.text)
    r.close()

w = network.WLAN(network.STA_IF)
w.active(True)
w.connect(ssid, password)
while not w.isconnected():
    time.sleep(0.5)
print("wifi:", w.ifconfig())

k1 = Pin(18, Pin.IN, Pin.PULL_UP)
k2 = Pin(19, Pin.IN, Pin.PULL_UP)

l1 = k1.value()
l2 = k2.value()

while True:
    v1 = k1.value()
    v2 = k2.value()

    if v1 != l1:
        if v1 == 0:
            print("knop 1")
            light_on()
        l1 = v1

    if v2 != l2:
        if v2 == 0:
            print("knop 2")
            light_off()
        l2 = v2

    time.sleep(0.02)
