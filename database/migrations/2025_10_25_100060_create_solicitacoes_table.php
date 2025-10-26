<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitacoes', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 120);
            $table->string('usuarioRede', 120);
            $table->string('email');
            $table->string('setor')->nullable();

            // cargo será definido na aprovação; começa como null
            $table->foreignId('cargo_id')->nullable()->constrained('cargos')->nullOnDelete();

            // Somente created_at customizado conforme Model
            $table->timestamp('data_solicitacao')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');
    }
};
