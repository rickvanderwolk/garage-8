#!/bin/bash

export LANG=C.UTF-8
export LC_ALL=C.UTF-8

CHARS=("░" "▒" "▓" "█" "▄" "▀" "▌" "▐" "▖" "▗" "▘" "▙" "▚" "▛" "▜" "▝" "▞" "▟" "#" "*" "+" "~" "." "|" "/" "\\" "-" "_" "@" "&" "%")
EMOJIS=("🎉" "🎊" "🥳" "✨" "🎈" "🎂" "🍰" "🍾" "🥂" "🎵" "🎶" "💃" "🕺" "🪩" "🍹" "🍻")
WIDTH=$(tput cols)
HEIGHT=$(tput lines)

tput civis

trap "tput cnorm; exit" INT

MODE=${1:-color}

while true; do
    if [[ "$MODE" == "emojis" ]]; then
        CHAR=${EMOJIS[$RANDOM % ${#EMOJIS[@]}]}
    else
        CHAR=${CHARS[$RANDOM % ${#CHARS[@]}]}
    fi

    X=$((RANDOM % WIDTH))
    Y=$((RANDOM % HEIGHT))

    tput cup $Y $X

    if [[ "$MODE" == "color" ]]; then
        COLOR=$((RANDOM % 7 + 1))
        tput setaf $COLOR
    else
        tput sgr0
    fi

    echo -n "$CHAR"
done
