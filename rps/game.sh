#!/bin/bash

choices=("r" "p" "s")
player_score=0
computer_score=0
ties=0
total_games=0
use_emojis=true
auto_mode=false
custom_command=""
computer_strategy="random"
strategy_switch_counter=$((RANDOM % 10 + 1))

show_choice() {
    case $1 in
        r) echo "Rock" ;;
        p) echo "Paper" ;;
        s) echo "Scissors" ;;
    esac
}

determine_winner() {
    ((total_games++))
    if [[ "$1" == "$2" ]]; then
        [[ $use_emojis == true ]] && echo "It's a tie" || echo "It's a tie"
        ((ties++))
    elif [[ ("$1" == "r" && "$2" == "s") || ("$1" == "p" && "$2" == "r") || ("$1" == "s" && "$2" == "p") ]]; then
        [[ $use_emojis == true ]] && echo "You win" || echo "You win"
        ((player_score++))
    else
        [[ $use_emojis == true ]] && echo "Computer wins" || echo "Computer wins"
        ((computer_score++))
    fi
}

computer_move() {
    case $computer_strategy in
        random)
            echo "${choices[$RANDOM % 3]}" ;;
        repeat-last)
            echo "$last_player_choice" ;;
        counter-last)
            case "$last_player_choice" in
                r) echo "p" ;;
                p) echo "s" ;;
                s) echo "r" ;;
            esac ;;
        favor-rock)
            [[ $((RANDOM % 100)) -lt 70 ]] && echo "r" || echo "${choices[$RANDOM % 3]}" ;;
        avoid-repeat)
            [[ "$last_computer_choice" == "r" ]] && echo "${choices[$RANDOM % 2 + 1]}" || [[ "$last_computer_choice" == "p" ]] && echo "${choices[$((RANDOM % 2 == 0 ? 0 : 2))]}" || echo "${choices[$((RANDOM % 2))]}" ;;
        mimic-pattern)
            [[ $((total_games % 2)) -eq 0 ]] && echo "r" || echo "p" ;;
    esac
}

display_score() {
    win_percentage=0
    loss_percentage=0
    tie_percentage=0

    if ((total_games > 0)); then
        win_percentage=$((player_score * 100 / total_games))
        loss_percentage=$((computer_score * 100 / total_games))
        tie_percentage=$((ties * 100 / total_games))
    fi

    echo -e "\nTotal games: $total_games"
    echo -e "Score: Player wins $player_score ($win_percentage%) | Computer wins $computer_score ($loss_percentage%) | Ties $ties ($tie_percentage%)"

    if ((player_score > computer_score)); then
        [[ $use_emojis == true ]] && echo "Status: You are leading" || echo "Status: You are leading"
    elif ((computer_score > player_score)); then
        [[ $use_emojis == true ]] && echo "Status: Computer is leading" || echo "Status: Computer is leading"
    else
        [[ $use_emojis == true ]] && echo "Status: It's a tie" || echo "Status: It's a tie"
    fi
}

display_instructions() {
    echo -e
    echo "==============================================="
    echo "Rock-Paper-Scissors"
    echo "==============================================="
    echo "Press: 'r' for Rock | 'p' for Paper | 's' for Scissors | '/<bash_command>' to enter custom strategy | 'Ctrl+C' to quit the game."
}

while true; do
    display_instructions

    if [[ $auto_mode == false ]]; then
        read -r -n1 -s input
        if [[ "$input" == "/" ]]; then
            read -r custom_command
            custom_command=${custom_command#/} # Remove leading slash if present
            if [[ -z "$custom_command" ]]; then
                custom_command="echo \${choices[\$RANDOM % 3]}"
            fi
            auto_mode=true
            echo "Auto-play started with command: '$custom_command'."
            continue
        fi
    else
        input=$(eval "$custom_command")
    fi

    if [[ "$input" =~ ^[rps]$ ]]; then
        last_player_choice="$input"

        computer_choice=$(computer_move)

        ((strategy_switch_counter--))
        if (( strategy_switch_counter == 0 )); then
            strategies=("random" "repeat-last" "counter-last" "favor-rock" "avoid-repeat" "mimic-pattern")
            computer_strategy=${strategies[$RANDOM % ${#strategies[@]}]}
            strategy_switch_counter=$((RANDOM % 10 + 1))
            echo "Computer switched strategy to: '$computer_strategy'"
        fi

        last_computer_choice="$computer_choice"

        echo -e
        if [[ $auto_mode == true ]]; then
            echo "Command: '$custom_command'"
        fi
        echo -n "You chose: "; show_choice "$input"
        echo -n "Computer chose: "; show_choice "$computer_choice"

        determine_winner "$input" "$computer_choice"
        display_score
    fi

done
