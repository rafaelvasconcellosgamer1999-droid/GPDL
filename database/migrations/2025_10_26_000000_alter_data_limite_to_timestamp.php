<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('processos') || !Schema::hasColumn('processos', 'data_limite')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();
        try {
            switch ($driver) {
                case 'mysql':
                    DB::statement('ALTER TABLE processos MODIFY data_limite TIMESTAMP NULL');
                    break;
                case 'pgsql':
                    DB::statement('ALTER TABLE processos ALTER COLUMN data_limite TYPE timestamp without time zone USING data_limite::timestamp');
                    break;
                case 'sqlite':
                    // SQLite does not enforce column types strictly; no-op
                    break;
                default:
                    // Try via DBAL if available
                    if (class_exists(\Doctrine\DBAL\Schema\Comparator::class)) {
                        Schema::table('processos', function ($table) {
                            /** @var \Illuminate\Database\Schema\Blueprint $table */
                            $table->timestamp('data_limite')->nullable()->change();
                        });
                    }
                    break;
            }
        } catch (\Throwable $e) {
            // Soft-fail: allow manual adjustment if needed
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('processos') || !Schema::hasColumn('processos', 'data_limite')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();
        try {
            switch ($driver) {
                case 'mysql':
                    DB::statement('ALTER TABLE processos MODIFY data_limite DATE NULL');
                    break;
                case 'pgsql':
                    DB::statement('ALTER TABLE processos ALTER COLUMN data_limite TYPE date USING date(data_limite)');
                    break;
                case 'sqlite':
                    // No-op
                    break;
                default:
                    if (class_exists(\Doctrine\DBAL\Schema\Comparator::class)) {
                        Schema::table('processos', function ($table) {
                            /** @var \Illuminate\Database\Schema\Blueprint $table */
                            $table->date('data_limite')->nullable()->change();
                        });
                    }
                    break;
            }
        } catch (\Throwable $e) {
            // Ignore rollback failure
        }
    }
};

