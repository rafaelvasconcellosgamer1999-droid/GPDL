<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Evita necessidade de doctrine/dbal: drop e recria a coluna como nullable
        Schema::table('solicitacoes', function (Blueprint $table) {
            if (Schema::hasColumn('solicitacoes', 'cargo_id')) {
                try {
                    $table->dropForeign(['cargo_id']);
                } catch (\Throwable $e) {
                    // Ignora caso a FK tenha outro nome ou já tenha sido removida
                }
                $table->dropColumn('cargo_id');
            }
        });

        Schema::table('solicitacoes', function (Blueprint $table) {
            $table->foreignId('cargo_id')->nullable()->constrained('cargos')->nullOnDelete();
        });
    }

    public function down(): void
    {
        // Reverte para NOT NULL com cascadeOnDelete
        Schema::table('solicitacoes', function (Blueprint $table) {
            try {
                $table->dropForeign(['cargo_id']);
            } catch (\Throwable $e) {
                // ignore
            }
            $table->dropColumn('cargo_id');
        });

        Schema::table('solicitacoes', function (Blueprint $table) {
            $table->foreignId('cargo_id')->constrained('cargos')->cascadeOnDelete();
        });
    }
};

