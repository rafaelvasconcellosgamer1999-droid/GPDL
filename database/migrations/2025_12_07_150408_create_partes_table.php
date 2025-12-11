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
        Schema::create('partes', function (Blueprint $table) {
            $table->id();

          
            $table->foreignId('processo_id')
                  ->constrained('processos2') 
                  ->onDelete('set null');

            $table->string('nome');
            $table->string('cpf_cnpj')->unique();
            $table->string('qualificacao'); 
            $table->string('tipo_qualificacao'); 
            $table->boolean('parte_principal')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partes');
    }
};