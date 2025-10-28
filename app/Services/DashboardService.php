<?php

namespace App\Services;

use App\Models\Processo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    /**
     * 📊 Retorna estatísticas principais do dashboard (cache de 5 min)
     */
    public static function gerarEstatisticas(): array
    {
        return Cache::remember('dashboard_stats', 300, function () {
            $stats = [
                'ativos' => 0,
                'pendentes' => 0,
                'vencidos' => 0,
                'finalizados7d' => 0,
                'finalizadosMes' => 0,
                'ativos_hoje' => 0,
                'ativos_48h' => 0,
            ];

            if (!Schema::hasTable('processos')) {
                return $stats;
            }

            $now = now();

            // 🔹 Usa os escopos do model
            $stats['ativos']     = Processo::abertos()->count();
            $stats['pendentes']  = Processo::pendentesCiencia()->count();
            $stats['vencidos']   = Processo::vencidos()->count();

            // 🔹 Finalizados 7d / mês
            $stats['finalizados7d'] = Processo::whereNotNull('data_finalizacao')
                ->whereBetween('data_finalizacao', [$now->copy()->subDays(6)->startOfDay(), $now])
                ->count();

            $stats['finalizadosMes'] = Processo::whereNotNull('data_finalizacao')
                ->whereBetween('data_finalizacao', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
                ->count();

            // 🔹 Prazo hoje e 48h
            if (Schema::hasColumn('processos', 'data_limite')) {
                $startOfDay = $now->copy()->startOfDay();
                $endOfToday = $now->copy()->endOfDay();
                $endNext48h = $now->copy()->addHours(48);

                $stats['ativos_hoje'] = DB::table('processos')
                    ->whereNull('data_finalizacao')
                    ->whereBetween('data_limite', [$startOfDay, $endOfToday])
                    ->count();

                $stats['ativos_48h'] = DB::table('processos')
                    ->whereNull('data_finalizacao')
                    ->whereBetween('data_limite', [$endOfToday->copy()->addSecond(), $endNext48h])
                    ->count();
            }

            return $stats;
        });
    }

    /**
     * 📋 Processos em andamento (cache de 5 min)
     */
    public static function listarEmAndamento(): array
    {
        return Cache::remember('dashboard_em_andamento', 300, function () {
            if (!Schema::hasTable('processos')) {
                return [];
            }

            $rows = Processo::query()
                ->abertos()
                ->orderByDesc('data_limite')
                ->limit(4)
                ->get(['assunto', 'data_limite', 'procurador_responsavel_id']);

            return $rows->map(fn($r) => [
                'titulo' => $r->assunto ?? 'Processo',
                'entidade' => null,
                'responsavel' => optional($r->responsavel)->nome,
                'vencimento' => optional($r->data_limite)->format('d/m/Y'),
            ])->toArray();
        });
    }

    /**
     * 👥 Capacidade do time por responsável (cache 5 min por view)
     */
    public static function capacidadePorResponsavel(string $view = 'ativos'): array
    {
        return Cache::remember("dashboard_capacidade_{$view}", 300, function () use ($view) {
            if (!Schema::hasTable('processos') || !Schema::hasColumn('processos', 'procurador_responsavel_id')) {
                return [];
            }

            $now = now();
            $query = DB::table('processos')
                ->select('procurador_responsavel_id', DB::raw('count(*) as qtd'))
                ->groupBy('procurador_responsavel_id');

            if ($view === 'encerrados') {
                $query->whereNotNull('data_finalizacao');
            } else {
                $query->whereNull('data_finalizacao');
                if ($view === 'pendentes') {
                    $query->whereNull('data_limite');
                } elseif ($view === 'vencidos') {
                    $query->where('data_limite', '<=', $now);
                } elseif ($view === 'ativos') {
                    $query->where('data_limite', '>', $now);
                }
            }

            $dados = $query->get();
            if ($dados->isEmpty()) return [];

            $total = max(1, $dados->sum('qtd'));

            $users = DB::table('usuarios')
                ->whereIn('id', $dados->pluck('procurador_responsavel_id')->filter())
                ->pluck('nome', 'id');

            return $dados->map(function ($d) use ($users, $total) {
                $nome = $users[$d->procurador_responsavel_id] ?? ('ID ' . $d->procurador_responsavel_id);
                $partes = preg_split('/\s+/', trim($nome));
                $sigla = strtoupper((mb_substr($partes[0] ?? '', 0, 1)) . (mb_substr($partes[1] ?? '', 0, 1)));

                return [
                    'sigla' => $sigla ?: 'ID',
                    'nome' => $nome,
                    'processos' => (int) $d->qtd,
                    'perc' => (int) round($d->qtd * 100 / $total),
                ];
            })->toArray();
        });
    }
}
