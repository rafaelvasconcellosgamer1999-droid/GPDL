<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargo_permissoes_scoped', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cargo_id')->constrained('cargos')->cascadeOnDelete();
            $table->foreignId('permissao_id')->constrained('permissoes')->cascadeOnDelete();
            $table->foreignId('scope_id')->nullable()->constrained('scopes')->nullOnDelete();
            $table->foreignId('setor_id')->nullable()->constrained('setores')->nullOnDelete();
            $table->timestamp('criado_em')->useCurrent();

            // Indices auxiliares
            $table->index(['cargo_id', 'permissao_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargo_permissoes_scoped');
    }
};

