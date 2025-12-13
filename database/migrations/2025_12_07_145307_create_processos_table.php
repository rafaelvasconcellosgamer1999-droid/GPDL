<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('processos2', function (Blueprint $table) {
            $table->id();
            $table->string('area_atuacao');
            $table->string('tipo_processo')->nullable(); 
            $table->string('cnj')->unique();
            $table->string('municipio');
            $table->string('instancia');
            $table->string('status')->default('em andamento'); 
            $table->decimal('valor_causa', 15, 2)->nullable();
            $table->string('tipo_pagamento')->nullable();
            $table->string('numero_agravo')->nullable();
            $table->string('numero_protocolo')->nullable();
            $table->string('tipo_distribuicao')->nullable();
            $table->string('numero_suspensao')->nullable();
            $table->string('motivo_distribuicao')->nullable();

            $table->foreignId('tribunal_id')->nullable()->constrained('entidades_juridicas')->onDelete('set null'); //entidade_juridica_id
            $table->foreignId('acao_id')->constrained('tematicas')->onDelete('set null'); //tematica_id
            $table->foreignId('assunto_id')->constrained('tematicas')->onDelete('set null'); //tematica_id
            $table->foreignId('orgao_origem_id')->constrained('entidades_juridicas')->onDelete('set null'); //entidade_juridica_id
            $table->foreignId('orgao_julgador_id')->constrained('entidades_juridicas')->onDelete('set null'); //entidade_juridica_id
            $table->foreignId('usuario_cadastro_id')->constrained('users')->onDelete('set null'); //quem cadastr
            $table->foreignId('procurador_responsavel_id')->constrained('users')->onDelete('set null'); //user_id where cargo == procurador
            $table->foreignId('processo_ref_id')->nullable()->constrained('processos2')->onDelete('set null'); //processo pai
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('processos2', function (Blueprint $table) {
            $table->dropForeign(['processo_pai_id']);
        });

        Schema::dropIfExists('processos2');
    }
};
