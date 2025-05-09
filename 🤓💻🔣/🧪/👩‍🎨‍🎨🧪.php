<?php

use PHPUnit\Framework\TestCase;

require_once '👩‍🎨‍🎨.php';

class 👩‍🎨‍🎨🧪 extends TestCase
{
    public function test👩‍🎨🎨()
    {
        $👩‍🎨 = new 👩‍🎨;
        $🎨 = $👩‍🎨->🎨();
        $this->assertInstanceOf(🎨::class, $🎨);
    }

    public function test🎨🖼️()
    {
        $🎨 = new 🎨;
        $🖼️ = $🎨->🖼️();
        $this->assertInstanceOf(🖼️::class, $🖼️);
    }

    public function test🖼️✨()
    {
        $🖼️ = new 🖼️;

        ob_start();
        $✨ = $🖼️->✨();
        $📤 = ob_get_clean();

        $this->assertInstanceOf(🖼️::class, $✨);
        $this->assertMatchesRegularExpression('/🧘|🫀|🌈|🎶|🪞|🌊/', $📤);
    }
}
