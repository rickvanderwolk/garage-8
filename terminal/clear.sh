#!/bin/bash

export LANG=C.UTF-8
export LC_ALL=C.UTF-8

WIDTH=$(tput cols)
HEIGHT=$(tput lines)

tput civis
trap "tput cnorm; exit" INT

while true; do
    X=$((RANDOM % WIDTH))
    Y=$((RANDOM % HEIGHT))

    tput cup $Y $X
    echo -n " "

    if [[ $(tput lines) -eq 0 ]]; then
        break
    fi
done

tput cnorm
