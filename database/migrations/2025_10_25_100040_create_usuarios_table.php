<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 120);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('usuarioRede')->unique();
            $table->string('senha');

            $table->foreignId('cargo_id')->nullable()->constrained('cargos')->nullOnDelete();
            $table->foreignId('setor_id')->nullable()->constrained('setores')->nullOnDelete();

            $table->boolean('status')->default(true);
            $table->boolean('precisa_trocar_senha')->default(false);

            $table->rememberToken();

            // Somente created_at customizado, conforme User::class (UPDATED_AT = null)
            $table->timestamp('data_criacao')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};

