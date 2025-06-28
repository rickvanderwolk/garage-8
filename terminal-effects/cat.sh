#!/bin/bash

export LANG=C.UTF-8
export LC_ALL=C.UTF-8

trap "tput cnorm; exit" INT

tput civis

clear

frame1="
    |\_/|
    |0 0|
   =\_Y_/=
    /   \\
"

frame2="
    |\_/|
    |0 -|
   =\_Y_/=
    /   \\
"

frames=("$frame1" "$frame1" "$frame1" "$frame1" "$frame1" "$frame2" "$frame1")

printf "\033[3J\033[H\033[2J"

while true; do
    for frame in "${frames[@]}"; do
        clear
        echo -e "$frame"
        sleep 0.3
    done
done

tput cnorm
