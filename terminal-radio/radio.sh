#!/bin/bash

HISTORY_FILE="$HOME/.radio_history"
RADIO_LIST_FILE="./stations.txt"

if [[ ! -f "$RADIO_LIST_FILE" ]]; then
    echo "Radio list file ($RADIO_LIST_FILE) not found!"
    exit 1
fi

touch "$HISTORY_FILE"
cat "$HISTORY_FILE" "$RADIO_LIST_FILE" | awk '!seen[$0]++' > /tmp/combined_radiolist.txt

selection=$(cut -d'|' -f1 /tmp/combined_radiolist.txt | fzf --prompt="Search or select a radio station: ")

if [[ -n "$selection" ]]; then
    url=$(grep "^$selection|" /tmp/combined_radiolist.txt | cut -d'|' -f2)
    echo "$selection|$url" > "$HISTORY_FILE.tmp"
    grep -v "^$selection|" "$HISTORY_FILE" >> "$HISTORY_FILE.tmp"
    mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"

    ffplay -nodisp -autoexit "$url"
else
    echo "No station selected."
fi
