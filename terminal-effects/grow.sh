#!/bin/bash

export LANG=C.UTF-8
export LC_ALL=C.UTF-8

CHARS=("█" "▓" "▒" "░" "#" "*" "+" "~" "." "|" "/" "\\" "-" "_" "@" "&" "%")
WIDTH=$(tput cols)
HEIGHT=$(tput lines)

tput civis
trap "tput cnorm; exit" INT

X=$((WIDTH / 2))
Y=$((HEIGHT / 2))

while true; do
    X=$(( (X + RANDOM % 3 - 1 + WIDTH) % WIDTH ))
    Y=$(( (Y + RANDOM % 3 - 1 + HEIGHT) % HEIGHT ))

    tput cup $Y $X
    echo -n "${CHARS[$RANDOM % ${#CHARS[@]}]}"

    sleep 0.01
done
