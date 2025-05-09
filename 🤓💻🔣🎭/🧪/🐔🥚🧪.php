<?php

use PHPUnit\Framework\TestCase;

require_once '🐔🥚.php';

class 🐔🥚🧪 extends TestCase
{
    public function test💘🐔💖✅()
    {
        $🐔 = new 🐔;
        $🐓 = new 🐓;
        $🐔 = $🐓->💘($🐔);
        $🥚 = $🐔->🥚('');

        $🔍 = new ReflectionClass($🥚);
        $💖 = $🔍->getProperty("💖");
        $💖->setAccessible(true);

        $this->assertTrue($💖->getValue($🥚));
    }

    public function test🐔🥚💖❌()
    {
        $🐔 = new 🐔;
        $🥚 = $🐔->🥚('');

        $🔍 = new ReflectionClass($🥚);
        $💖 = $🔍->getProperty("💖");
        $💖->setAccessible(true);

        $this->assertFalse($💖->getValue($🥚));
    }

    public function test🥚🪹🐣()
    {
        $🥚 = new 🥚(true);

        ob_start();
        $🥚->🪹();
        $📤 = ob_get_clean();

        $this->assertStringContainsString('🐣', $📤);
    }

    public function test🥚🪹🚫()
    {
        $🥚 = new 🥚(false);

        ob_start();
        $🥚->🪹();
        $📤 = ob_get_clean();

        $this->assertStringContainsString('🚫', $📤);
    }
}
