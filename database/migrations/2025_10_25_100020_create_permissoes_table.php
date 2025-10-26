<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissoes', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 60)->unique();
            $table->string('descricao', 120)->nullable();
            // Sem timestamps, conforme Model Permissao::class
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissoes');
    }
};

