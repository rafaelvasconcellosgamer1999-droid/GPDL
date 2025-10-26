<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('processos') && Schema::hasColumn('processos', 'status')) {
            Schema::table('processos', function (Blueprint $table) {
                // Tenta remover índice padrão se existir
                try { $table->dropIndex(['status']); } catch (\Throwable $e) {}
                $table->dropColumn('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('processos') && !Schema::hasColumn('processos', 'status')) {
            Schema::table('processos', function (Blueprint $table) {
                $table->string('status', 60)->nullable();
                try { $table->index('status'); } catch (\Throwable $e) {}
            });
        }
    }
};

