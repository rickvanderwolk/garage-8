<?php

/**
 * 🐓💘🐔
 */
class 🐓 {

    /**
     * @param 🐔 $🐔
     * @return 🐔
     */
    public function 💘(🐔 $🐔): 🐔
    {
        echo '🐓💘🐔';
        return $🐔->💞();
    }
}

/**
 * 🐔🥚🪹
 */
class 🐔 {

    /**
     * @return $this
     */
    public function 💞()
    {
        $this->💖 = true;
        return $this;
    }

    /**
     * @param string $🐔
     * @return 🥚
     */
    public function 🥚(string $🐔 = '🐔'): 🥚
    {
        echo $🐔 ? "$🐔 → 🥚" : ' → 🥚';
        return new 🥚($this->💖);
    }

    /** @var bool */
    protected bool $💖 = false;
}

/**
 * 🥚→🪹→🐣/🚫
 */
class 🥚 {

    /**
     * @param bool $💖
     */
    public function __construct(bool $💖)
    {
        $this->💖 = $💖;
    }

    /**
     * @return $this
     */
    public function 🪹()
    {
        echo $this->💖 ? ' → 🪹 → 🐣' : ' → 🪹 → 🚫';
        return $this;
    }

    /** @var bool */
    protected bool $💖;
}

// 🐓💘🐔🥚🪹
(new 🐓)->💘(new 🐔)->🥚('')->🪹();
echo PHP_EOL;

// 🐔🥚🪹→🚫
(new 🐔)->🥚('🐔')->🪹();
echo PHP_EOL;
