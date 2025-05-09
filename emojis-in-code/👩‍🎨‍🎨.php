<?php

/**
 * 👩‍🎨🎨🖼️✨
 */
class 👩‍🎨 {

    /**
     * @return 🎨
     */
    public function 🎨() {
        echo '👩‍🎨 → 🎨';
        return new 🎨;
    }
}

/**
 * 🎨🖼️
 */
class 🎨 {

    /**
     * @return 🖼️
     */
    public function 🖼️() {
        echo ' → 🖼️';
        return new 🖼️;
    }
}

/**
 * 🖼️✨🌟
 */
class 🖼️ {

    /**
     * @return $this
     */
    public function ✨() {
        $🌟 = [' → 🧘', ' → 🫀', ' → 🌈', ' → 🎶', ' → 🪞', ' → 🌊'];
        echo $🌟[array_rand($🌟)];
        return $this;
    }
}

(new 👩‍🎨)->🎨()->🖼️()->✨();
echo PHP_EOL;
