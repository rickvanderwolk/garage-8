#!/bin/bash

choices=("r" "p" "s")
player_score=0
computer_score=0
ties=0
total_games=0

show_choice() {
    case $1 in
        r) echo "Rock 🪨" ;;
        p) echo "Paper 📄" ;;
        s) echo "Scissors ✂️" ;;
    esac
}

determine_winner() {
    ((total_games++))
    if [[ "$1" == "$2" ]]; then
        echo "🟡 It's a tie"
        ((ties++))
    elif [[ ("$1" == "r" && "$2" == "s") || ("$1" == "p" && "$2" == "r") || ("$1" == "s" && "$2" == "p") ]]; then
        echo "🟢 You win"
        ((player_score++))
    else
        echo "🔴 Computer wins"
        ((computer_score++))
    fi
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

    echo -e "\n🎮 Total games: $total_games"
    echo -e "📊 Score: Player wins 🟢 $player_score ($win_percentage%) | Computer wins 🔴 $computer_score ($loss_percentage%) | Ties 🟡 $ties ($tie_percentage%)"

    if ((player_score > computer_score)); then
        echo "🏆 Status: 🟢 You are leading"
    elif ((computer_score > player_score)); then
        echo "🏆 Status: 🔴 Computer is leading"
    else
        echo "🏆 Status: 🟡 It's a tie"
    fi
}

display_instructions() {
    echo -e
    echo -e
    echo "==============================================="
    echo "🪨📄✂️  Rock-Paper-Scissors"
    echo "==============================================="
    echo "Press: 'r' for Rock 🪨 | 'p' for Paper 📄 | 's' for Scissors ✂️  | 'Ctrl+C' to quit the game."
}

while true; do
    display_instructions

    read -n1 -s player_choice

    if [[ "$player_choice" =~ ^[rps]$ ]]; then
        computer_choice=${choices[$RANDOM % 3]}

        echo -e
        echo -n "🧑 You chose: "; show_choice "$player_choice"
        echo -n "💻 Computer chose: "; show_choice "$computer_choice"

        determine_winner "$player_choice" "$computer_choice"
        display_score
    fi
done
