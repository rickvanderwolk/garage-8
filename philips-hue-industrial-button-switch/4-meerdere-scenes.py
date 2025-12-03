from machine import Pin
import time
import network
import urequests
import ujson

ssid = ""
password = ""
bridge_ip = ""
user = ""
group_id = "82"
scene_id_1 = ""
scene_id_2 = ""
long_press_ms = 800

def scene_on_1():
    url = "http://%s/api/%s/groups/%s/action" % (bridge_ip, user, group_id)
    payload = ujson.dumps({"scene": scene_id_1})
    r = urequests.put(url, data=payload)
    print("scene 1:", r.text)
    r.close()

def scene_on_2():
    url = "http://%s/api/%s/groups/%s/action" % (bridge_ip, user, group_id)
    payload = ujson.dumps({"scene": scene_id_2})
    r = urequests.put(url, data=payload)
    print("scene 2:", r.text)
    r.close()

def group_off():
    url = "http://%s/api/%s/groups/%s/action" % (bridge_ip, user, group_id)
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
press2_time = None

while True:
    v1 = k1.value()
    v2 = k2.value()

    if v1 != l1:
        if v1 == 0:
            print("knop 1")
            group_off()
        l1 = v1

    if v2 != l2:
        now = time.ticks_ms()
        if v2 == 0:
            press2_time = now
        else:
            if press2_time is not None:
                dt = time.ticks_diff(now, press2_time)
                if dt < long_press_ms:
                    print("knop 2 kort")
                    scene_on_1()
                else:
                    print("knop 2 lang")
                    scene_on_2()
            press2_time = None
        l2 = v2

    time.sleep(0.02)
