<?php

class 👩‍🎨 {
    public function 🎨() {
        echo '👩‍🎨 → 🎨';
        return new 🎨;
    }
}

class 🎨 {
    public function 🖼️() {
        echo ' → 🖼️';
        return new 🖼️;
    }
}

class 🖼️ {
    public function ✨() {
        $🌟 = [' → 🧘', ' → 🫀', ' → 🌈', ' → 🎶', ' → 🪞', ' → 🌊'];
        echo $🌟[array_rand($🌟)];
        return $this;
    }
}

(new 👩‍🎨)->🎨()->🖼️()->✨();
echo PHP_EOL;
