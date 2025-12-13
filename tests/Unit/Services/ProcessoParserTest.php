<?php

namespace Tests\Unit\Services;

use App\Services\ProcessoParser;
use PHPUnit\Framework\TestCase;

class ProcessoParserTest extends TestCase
{
    protected ProcessoParser $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new ProcessoParser();
    }

    public function testExtrairNumeroProcesso()
    {
        $text = "Processo nº 0001234-56.2023.8.26.0100 em andamento.";
        $this->assertEquals('0001234-56.2023.8.26.0100', $this->parser->extrairNumeroProcesso($text));

        $text = "Outro formato 12345678901234567890";
        $this->assertEquals('12345678901234567890', $this->parser->extrairNumeroProcesso($text));

        $this->assertNull($this->parser->extrairNumeroProcesso("Sem numero aqui"));
    }

    public function testExtrairAssunto()
    {
        $text = "Assunto Principal\nLinha 2\nLinha 3";
        $this->assertEquals('Assunto Principal', $this->parser->extrairAssunto($text));

        $text = "  Assunto   com   espacos   \nLinha 2";
        $this->assertEquals('Assunto com espacos', $this->parser->extrairAssunto($text));
    }

    public function testSepararBlocos()
    {
        $text = "Bloco 1\n\nBloco 2\n\n\nBloco 3";
        $blocos = $this->parser->separarBlocos($text);
        $this->assertCount(3, $blocos);
        $this->assertEquals('Bloco 1', $blocos[0]);
        $this->assertEquals('Bloco 2', $blocos[1]);
        $this->assertEquals('Bloco 3', $blocos[2]);

        $text = "Bloco Unico";
        $blocos = $this->parser->separarBlocos($text);
        $this->assertCount(1, $blocos);
    }
}
