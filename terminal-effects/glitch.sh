#!/bin/bash

export LANG=C.UTF-8
export LC_ALL=C.UTF-8

WIDTH=$(tput cols)
HEIGHT=$(tput lines)
CHARS=("*" "+" "~" "." "|" "/" "\\" "-" "_" "#" "%" "&" "@" "^" "•" "◦" "░" "▒" "▓")
SPEED=0.01
MAX_LINES=30
MAX_LENGTH=10

tput civis
trap "tput cnorm; exit" INT

rainfall() {
    while true; do
        X=$((RANDOM % WIDTH))
        LENGTH=$((RANDOM % MAX_LENGTH + 3))
        DELAY=$((RANDOM % 3 + 1))
        CURRENT_Y=0

        while ((CURRENT_Y < HEIGHT + LENGTH)); do
            for ((i=0; i<LENGTH; i++)); do
                Y=$((CURRENT_Y - i))
                if ((Y >= 0 && Y < HEIGHT)); then
                    tput cup $Y $X
                    echo -n "${CHARS[$RANDOM % ${#CHARS[@]}]}"
                fi
            done

            if ((CURRENT_Y - LENGTH >= 0)); then
                tput cup $((CURRENT_Y - LENGTH)) $X
                echo -n " "
            fi

            ((CURRENT_Y++))
            sleep $((RANDOM % 2 + 1))e-2
        done

        sleep $((RANDOM % 2 + 1))
    done
}

for ((i=0; i<MAX_LINES; i++)); do
    rainfall &
done

wait
