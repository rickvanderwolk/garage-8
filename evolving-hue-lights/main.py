#!/usr/bin/env python3
import json
import time
import requests
import math
import argparse
import logging
import os
import sys
import random

CONFIG_FILE = 'config.json'

def is_running_in_terminal():
    return sys.stdout.isatty()

if is_running_in_terminal():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
else:
    logging.basicConfig(filename='main.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def wait_for_network(timeout=90):
    logging.info("Waiting for network connectivity...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            requests.get('https://1.1.1.1', timeout=5)
            logging.info("Network connectivity established.")
            return True
        except requests.RequestException:
            logging.warning("Network not available, retrying...")
            time.sleep(5)
    logging.error("Network not available after waiting.")
    return False

def load_config():
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.warning("Configuration file not found. Creating a new one.")
        return {}

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f)
        logging.info("Configuration saved.")

def find_bridge():
    logging.info("Searching for Hue Bridge...")
    r = requests.get('https://discovery.meethue.com/', timeout=10)
    r.raise_for_status()
    data = r.json()
    if not data:
        logging.error("No Hue Bridge found.")
        sys.exit(1)
    ip = data[0]['internalipaddress']
    logging.info(f"Hue Bridge found at IP: {ip}")
    return ip

def register_hue_user(bridge_ip):
    url = f"http://{bridge_ip}/api"
    payload = {"devicetype": "rgb_stepper#controller"}
    while True:
        logging.info("Press the button on the Hue Bridge to connect...")
        try:
            resp = requests.post(url, json=payload, timeout=5).json()
        except requests.RequestException as e:
            logging.warning(f"Connection error: {e}")
            time.sleep(5)
            continue
        if isinstance(resp, list) and resp and "success" in resp[0]:
            u = resp[0]["success"]["username"]
            logging.info("Connected to the Hue Bridge.")
            return u
        logging.warning("Waiting 5 seconds before retrying...")
        time.sleep(5)

def get_full_color_lights(bridge_ip, username):
    url = f"http://{bridge_ip}/api/{username}/lights"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()
    logging.info("Retrieving full color lights...")
    out = {}
    for lid, light in data.items():
        if light.get('type') in ['Extended color light', 'Color light']:
            logging.info(f"Found full color light: {light.get('name')} (ID: {lid})")
            out[lid] = light
    return out

def find_full_color_lights(bridge_ip, username, selected=None):
    lights = get_full_color_lights(bridge_ip, username)
    if not lights:
        logging.error("No full color lights available.")
        sys.exit(1)
    if not selected:
        chosen = []
        for lid in lights.keys():
            chosen.append(lid)
            logging.info(f"Selected light: {lights[lid]['name']} (ID: {lid})")
            if len(chosen) == 1:
                break
        if len(chosen) < 1:
            logging.error("No full color lights found.")
            sys.exit(1)
        logging.info("To choose specific lights, run with '--lights' followed by one or more light IDs.")
        return chosen
    chosen = []
    for lid in selected:
        if lid in lights:
            chosen.append(lid)
            logging.info(f"Selected light: {lights[lid]['name']} (ID: {lid})")
        else:
            logging.error(f"Light ID {lid} is invalid or not a full color light.")
            sys.exit(1)
    if len(chosen) < 1:
        logging.error("Please provide at least one valid light ID.")
        sys.exit(1)
    return chosen

def parse_arguments():
    p = argparse.ArgumentParser(description='Philips Hue RGB stepper')
    p.add_argument('--lights', nargs='+', help='IDs of one or more full color lights to control')
    p.add_argument('--speed', type=float, default=1.0, help='Seconds between updates')
    p.add_argument('--fade', type=float, default=1.0, help='Fade duration in seconds')
    return p.parse_args()

def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v

def rgb_init():
    return [random.randint(0,255), random.randint(0,255), random.randint(0,255)]

def normalize_rgb(r, g, b):
    """Normalize RGB so max component is 255 (full saturation)"""
    max_val = max(r, g, b)
    if max_val == 0:
        return r, g, b
    scale = 255.0 / max_val
    return int(round(r * scale)), int(round(g * scale)), int(round(b * scale))

def to_xy_bri(r, g, b):
    r, g, b = normalize_rgb(r, g, b)
    rn = r/255.0
    gn = g/255.0
    bn = b/255.0
    def t(c): return ((c + 0.055)/1.055)**2.4 if c > 0.04045 else c/12.92
    rL, gL, bL = t(rn), t(gn), t(bn)
    X = rL*0.649926 + gL*0.103455 + bL*0.197109
    Y = rL*0.234327 + gL*0.743075 + bL*0.022598
    Z = rL*0.000000 + gL*0.072310 + bL*0.986039
    s = X+Y+Z
    x = X/s if s != 0 else 0
    y = Y/s if s != 0 else 0
    bri = 254  # Always maximum brightness
    return x, y, bri

def update_light(bridge_ip, username, light_id, rgb, fade_seconds):
    x, y, bri = to_xy_bri(*rgb)
    data = {"on": True, "xy": [x, y], "bri": bri, "transitiontime": int(max(0, fade_seconds)*10)}
    url = f"http://{bridge_ip}/api/{username}/lights/{light_id}/state"
    try:
        requests.put(url, json=data, timeout=5)
    except requests.RequestException as e:
        logging.error(f"Failed to update light {light_id}: {e}")

def step_one_channel(rgb):
    idx = random.randint(0,2)
    delta = 1 if random.random() < 0.5 else -1
    rgb[idx] = clamp(rgb[idx] + delta, 0, 255)
    return rgb, idx, delta

def main_loop(bridge_ip, username, lids, speed, fade):
    states = {lid: rgb_init() for lid in lids}
    for lid in lids:
        logging.info(f"Initializing light {lid} with RGB: {states[lid]}")
        update_light(bridge_ip, username, lid, states[lid], fade)
    current_index = 0
    while True:
        lamp = lids[current_index]
        states[lamp], channel_idx, delta = step_one_channel(states[lamp])
        channel_name = ['R', 'G', 'B'][channel_idx]
        logging.info(f"Light {lamp}: {channel_name}{delta:+d} -> RGB: {states[lamp]}")
        update_light(bridge_ip, username, lamp, states[lamp], fade)
        current_index = (current_index + 1) % len(lids)
        time.sleep(max(0.5, speed))

def main():
    if not wait_for_network(90):
        logging.error("Network initialization failed. Exiting.")
        return
    cfg = load_config()
    if 'bridge_ip' not in cfg or 'username' not in cfg:
        bridge_ip = find_bridge()
        username = register_hue_user(bridge_ip)
        cfg['bridge_ip'] = bridge_ip
        cfg['username'] = username
        save_config(cfg)
    else:
        bridge_ip = cfg['bridge_ip']
        username = cfg['username']
    args = parse_arguments()
    lights = find_full_color_lights(bridge_ip, username, args.lights)
    logging.info(f"Full color lights being used: {lights}")
    main_loop(bridge_ip, username, lights, args.speed, args.fade)

if __name__ == "__main__":
    main()
