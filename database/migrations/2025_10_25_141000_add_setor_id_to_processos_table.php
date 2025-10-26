<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('processos')) {
            // Se a tabela ainda não existir neste projeto, mantenha esta migration inofensiva
            // (não cria a tabela aqui porque você já possui o schema antigo).
            return;
        }

        Schema::table('processos', function (Blueprint $table) {
            if (! Schema::hasColumn('processos', 'setor_id')) {
                // adiciona após um campo provável; ajuste se necessário
                $after = Schema::hasColumn('processos', 'responsavel_id') ? 'responsavel_id' : null;
                $column = $table->foreignId('setor_id')->nullable();
                if ($after) {
                    $column->after($after);
                }
                $column->constrained('setores')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('processos')) {
            return;
        }

        Schema::table('processos', function (Blueprint $table) {
            if (Schema::hasColumn('processos', 'setor_id')) {
                try {
                    $table->dropForeign(['setor_id']);
                } catch (\Throwable $e) {
                    // ignora caso a constraint tenha nome diferente
                }
                $table->dropColumn('setor_id');
            }
        });
    }
};

