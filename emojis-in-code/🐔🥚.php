<?php

class 🐓 {
    public function 💘(🐔 $🐔) {
        echo '🐓💘🐔';
        return $🐔->💞();
    }
}

class 🐔 {
    protected bool $💖 = false;

    public function 💞() {
        $this->💖 = true;
        return $this;
    }

    public function 🥚(string $🐔 = '🐔') {
        echo $🐔 ? "$🐔 → 🥚" : ' → 🥚';
        return new 🥚($this->💖);
    }
}

class 🥚 {
    protected bool $💖;

    public function __construct(bool $💖) {
        $this->💖 = $💖;
    }

    public function 🪹() {
        echo $this->💖 ? ' → 🪹 → 🐣' : ' → 🪹 → 🚫';
        return $this;
    }
}

(new 🐓)->💘(new 🐔)->🥚('')->🪹();
echo PHP_EOL;
(new 🐔)->🥚('🐔')->🪹();
echo PHP_EOL;
