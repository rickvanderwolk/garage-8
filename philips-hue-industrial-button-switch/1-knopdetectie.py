from machine import Pin
import time

k1 = Pin(18, Pin.IN, Pin.PULL_UP)
k2 = Pin(19, Pin.IN, Pin.PULL_UP)

l1 = k1.value()
l2 = k2.value()

while True:
    v1 = k1.value()
    v2 = k2.value()

    if v1 != l1:
        if v1 == 0:
            print("knop 1 ingedrukt")
        else:
            print("knop 1 los")
        l1 = v1

    if v2 != l2:
        if v2 == 0:
            print("knop 2 ingedrukt")
        else:
            print("knop 2 los")
        l2 = v2

    time.sleep(0.02)

