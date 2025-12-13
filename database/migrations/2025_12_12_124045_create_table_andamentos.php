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
        Schema::create('andamentos', function (Blueprint $table){
            $table->id();
            $table->foreignId('processso_id')->constrained('processos2')->onDelete('cascade');
            $table->foreignId('procurador_andamento_id')->constrained('usuarios');
            $table->foreignId('assessor_andamento_id')->nullable()->constrained('usuarios');
            $table->foreignId('usuario_cadastro_id')->constrained('usuarios');
            $table->string('tipo_andamento');
            $table->string('tipo_movimentacao');
            $table->text('descricao')->nullable();
            $table->date('data_prazo')->nullable();
            $table->date('data_andamento');
            $table->date('data_ciencia')->nullable();
            $table->string('status')->default('ativo');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('andamentos');
    }
};
