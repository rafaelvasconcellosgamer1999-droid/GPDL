<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('processos', function (Blueprint $table) {
            $table->id();
            // Somente os campos do legado + coluna extra de setor
            $table->unsignedBigInteger('processo_pai_id')->nullable();
            $table->string('orgao', 120)->nullable();
            $table->string('acao', 120)->nullable();
            $table->string('numero', 120)->nullable();
            $table->string('assunto', 180)->nullable();
            $table->text('partes_envolvidas')->nullable();
            $table->string('vara_juizo', 180)->nullable();

            $table->foreignId('procurador_responsavel_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('usuario_cadastro_id')->nullable()->constrained('usuarios')->nullOnDelete();

            $table->timestamp('data_entrada')->nullable();
            $table->timestamp('data_ciencia')->nullable();
            $table->text('ultimo_mov_texto')->nullable();
            $table->timestamp('ultimo_mov_data')->nullable();
            $table->date('data_limite')->nullable();
            $table->timestamp('data_finalizacao')->nullable();
            $table->string('status', 60)->nullable();
            $table->string('origem_cadastro', 120)->nullable();

            // Coluna extra solicitada
            $table->foreignId('setor_id')->nullable()->constrained('setores')->nullOnDelete();

            $table->timestamps();

            // Índices
            $table->index('processo_pai_id');
            $table->index('procurador_responsavel_id');
            $table->index('usuario_cadastro_id');
            $table->index('data_limite');
            $table->index('status');
            $table->index('setor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processos');
    }
};
