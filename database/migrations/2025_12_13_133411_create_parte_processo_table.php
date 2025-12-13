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
        // Esta tabela liga as Partes (Pessoas) aos Processos, definindo o papel que a parte exerce
        Schema::create('parte_processo', function (Blueprint $table) {
            $table->id();

            // Chave estrangeira para a tabela de Processos (assumida como 'processos2')
            $table->foreignId('processo_id')
                  ->constrained('processos2') // Altere para 'processos' se o nome for diferente
                  ->onDelete('cascade');

            // Chave estrangeira para a tabela de Partes (Pessoas)
            $table->foreignId('parte_id')
                  ->constrained('partes') // Assumindo que a tabela mestra de pessoas se chama 'partes'
                  ->onDelete('cascade');

            // Dados Específicos do Vínculo:
            $table->string('qualificacao')->nullable(); // Ex: 'Pessoa Física', 'Pessoa Jurídica'
            $table->string('tipo_qualificacao'); // Ex: 'Autor', 'Réu', 'Interessado'
            $table->boolean('parte_principal')->default(false); // Indica se é a parte principal do processo

            // Chave composta para evitar duplicidade de uma mesma parte no mesmo processo
            $table->unique(['processo_id', 'parte_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parte_processo');
    }
};