<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'ativos' => 0,
            'pendentes' => 0,
            'vencidos' => 0,
            'finalizados7d' => 0,
        ];

        $emAndamento = [];
        $capacidade = [];

        if (Schema::hasTable('processos')) {
            $capView = strtolower(request()->query('cap_view', 'ativos'));

            $finishedFlag = function ($q) {
                $hasAny = false;
                if (Schema::hasColumn('processos', 'status')) {
                    $q->whereIn(DB::raw("LOWER(status)"), ['finalizado', 'concluido', 'fechado']);
                    $hasAny = true;
                }
                if (Schema::hasColumn('processos', 'concluido')) {
                    $method = $hasAny ? 'orWhere' : 'where';
                    $q->{$method}('concluido', 1);
                    $hasAny = true;
                }
                if (Schema::hasColumn('processos', 'finalizado_em')) {
                    $method = $hasAny ? 'orWhereNotNull' : 'whereNotNull';
                    $q->{$method}('finalizado_em');
                    $hasAny = true;
                }
                if (Schema::hasColumn('processos', 'data_finalizacao')) {
                    $method = $hasAny ? 'orWhereNotNull' : 'whereNotNull';
                    $q->{$method}('data_finalizacao');
                    $hasAny = true;
                }
            };
            // ─────────────────────────────────────────────────────────────────────────────
            // Contadores "Hoje" e "48h" (próximas 48h, excluindo hoje) com base em data_limite
            // ─────────────────────────────────────────────────────────────────────────────
            $recentToday = 0;
            $recent48h   = 0;

            if (Schema::hasColumn('processos', 'data_limite')) {
                // Usa o timezone configurado no app (ex.: America/Sao_Paulo)
                $now         = now(config('app.timezone'));
                $startOfDay  = $now->copy()->startOfDay();
                $endOfToday  = $now->copy()->endOfDay();
                $endNext48h  = $now->copy()->addHours(48);

                // 🔹 Prazo HOJE (00:00 .. 23:59:59 do dia atual)
                $recentToday = DB::table('processos')
                    ->whereNot(function ($q) use ($finishedFlag) {
                        $finishedFlag($q);
                    })
                    ->whereBetween('data_limite', [$startOfDay, $endOfToday])
                    ->count();

                // 🔹 Prazo nas PRÓXIMAS 48H (após hoje, até +48h)
                //    Exclui o período de "Hoje" para não somar duas vezes
                $recent48h = DB::table('processos')
                    ->whereNot(function ($q) use ($finishedFlag) {
                        $finishedFlag($q);
                    })
                    ->whereBetween('data_limite', [$endOfToday->copy()->addSecond(), $endNext48h])
                    ->count();
            }

            $stats['ativos_hoje'] = (int) $recentToday;
            $stats['ativos_48h']  = (int) $recent48h;


            // Stats
            $ativosQuery = DB::table('processos');
            $ativosQuery->whereNot(function ($q) use ($finishedFlag) {
                $finishedFlag($q);
            });
            // Contabiliza apenas ATIVOS: com prazo futuro quando houver coluna de prazo
            $now = now();
            if (Schema::hasColumn('processos', 'data_limite')) {
                $ativosQuery->whereNotNull('data_limite')->where('data_limite', '>', $now);
            } else {
                foreach (['vencimento', 'prazo'] as $deadlineCol) {
                    if (Schema::hasColumn('processos', $deadlineCol)) {
                        $ativosQuery->whereNotNull($deadlineCol)->where($deadlineCol, '>', $now);
                        break;
                    }
                }
            }
            $stats['ativos'] = (int) $ativosQuery->count();

            $vencidosQuery = DB::table('processos');
            $vencidosQuery->whereNot(function ($q) use ($finishedFlag) {
                $finishedFlag($q);
            });
            foreach (['vencimento', 'prazo', 'data_limite'] as $deadlineCol) {
                if (Schema::hasColumn('processos', $deadlineCol)) {
                    $vencidosQuery->where($deadlineCol, '<', now());
                    break;
                }
            }
            $stats['vencidos'] = (int) $vencidosQuery->count();

            // PENDENTES: não finalizados e sem prazo (data_limite nula quando existir)
            $pendentesQuery = DB::table('processos');
            $pendentesQuery->whereNot(function ($q) use ($finishedFlag) {
                $finishedFlag($q);
            });

            if (Schema::hasColumn('processos', 'data_limite')) {
                $pendentesQuery->whereNull('data_limite');
            } else {
                $colunaEncontrada = false;
                foreach (['vencimento', 'prazo'] as $coluna) {
                    if (Schema::hasColumn('processos', $coluna)) {
                        $pendentesQuery->whereNull($coluna);
                        $colunaEncontrada = true;
                        break;
                    }
                }
                if (!$colunaEncontrada) {
                    // nenhuma das colunas existe → força a query a não retornar nada
                    $pendentesQuery->whereRaw('1=0');
                }
            }

            // ✅ Conta os pendentes corretamente
            $stats['pendentes'] = (int) $pendentesQuery->count();



            // Finalizados no mês e nos últimos 7 dias
            $stats['finalizados7d'] = 0;
            $stats['finalizadosMes'] = 0;

            if (Schema::hasColumn('processos', 'data_finalizacao')) {
                $col = 'data_finalizacao';

                // Corrige timezone e define limites com Carbon
                $agora = now();
                $inicio7d = $agora->copy()->subDays(6)->startOfDay(); // inclui hoje + 6 dias anteriores
                $inicioMes = $agora->copy()->startOfMonth();
                $fimMes = $agora->copy()->endOfMonth();

                // 🔹 Finalizados nos últimos 7 dias
                $stats['finalizados7d'] = (int) DB::table('processos')
                    ->whereNotNull($col)
                    ->whereBetween($col, [$inicio7d, $agora])
                    ->count();

                // 🔹 Finalizados no mês atual
                $stats['finalizadosMes'] = (int) DB::table('processos')
                    ->whereNotNull($col)
                    ->whereBetween($col, [$inicioMes, $fimMes])
                    ->count();
            }

            // Em andamento: somente ativos (prazo futuro)
            $listQuery = DB::table('processos');
            $listQuery->whereNot(function ($q) use ($finishedFlag) {
                $finishedFlag($q);
            });
            if (Schema::hasColumn('processos', 'data_limite')) {
                $listQuery->whereNotNull('data_limite')->where('data_limite', '>', now());
            }
            foreach (['updated_at', 'created_at', 'id'] as $orderCol) {
                if (Schema::hasColumn('processos', $orderCol)) {
                    $listQuery->orderByDesc($orderCol);
                    break;
                }
            }
            $rows = $listQuery->limit(4)->get();
            foreach ($rows as $row) {
                $titulo = $row->titulo ?? ($row->assunto ?? 'Processo');
                $emAndamento[] = [
                    'titulo' => self::utf8($titulo),
                    'entidade' => self::utf8($row->entidade ?? null),
                    'responsavel' => self::utf8($row->responsavel ?? null),
                    'vencimento' => $row->vencimento ?? ($row->prazo ?? ($row->data_limite ?? null)),
                ];
            }

            // Capacidade por responsável, com filtro cap_view
            $respCol = null;
            foreach (['procurador_responsavel_id', 'responsavel_id', 'usuario_id', 'user_id', 'responsavel'] as $c) {
                if (Schema::hasColumn('processos', $c)) {
                    $respCol = $c;
                    break;
                }
            }
            if ($respCol) {
                $q = DB::table('processos')->select($respCol . ' as resp', DB::raw('count(*) as qtd'));
                if ($capView === 'encerrados') {
                    $q->where(function ($q2) use ($finishedFlag) {
                        $finishedFlag($q2);
                    });
                } else {
                    $q->whereNot(function ($q2) use ($finishedFlag) {
                        $finishedFlag($q2);
                    });
                    if (Schema::hasColumn('processos', 'data_limite')) {
                        $now = now();
                        if ($capView === 'pendentes') {
                            $q->whereNull('data_limite');
                        } elseif ($capView === 'vencidos') {
                            $q->whereNotNull('data_limite')->where('data_limite', '<=', $now);
                        } elseif ($capView === 'ativos') {
                            $q->whereNotNull('data_limite')->where('data_limite', '>', $now);
                        }
                    }
                }
                $base = $q->groupBy('resp')->get();
                $total = max(1, $base->sum('qtd'));

                $namesById = [];
                if (in_array($respCol, ['procurador_responsavel_id', 'responsavel_id', 'usuario_id', 'user_id'])) {
                    $ids = $base->pluck('resp')->filter(fn($v) => !is_null($v))->unique()->values();
                    if ($ids->count() > 0 && Schema::hasTable('usuarios')) {
                        $users = DB::table('usuarios')->whereIn('id', $ids)->get(['id', 'nome']);
                        foreach ($users as $u) {
                            $namesById[$u->id] = $u->nome;
                        }
                    }
                }

                foreach ($base as $row) {
                    $nome = null;
                    if (!empty($namesById) && isset($namesById[$row->resp])) {
                        $nome = $namesById[$row->resp];
                    } elseif (is_string($row->resp)) {
                        $nome = (string) $row->resp;
                    } else {
                        $nome = 'ID ' . $row->resp;
                    }
                    $nome = self::utf8($nome);

                    $sigla = 'ID';
                    if (is_string($nome) && $nome !== '') {
                        $parts = preg_split('/\s+/', trim($nome));
                        $sigla = strtoupper((mb_substr($parts[0] ?? '', 0, 1)) . (mb_substr($parts[1] ?? '', 0, 1)));
                        $sigla = $sigla ?: 'ID';
                    }

                    $capacidade[] = [
                        'sigla' => $sigla,
                        'nome' => $nome,
                        'ativos' => (int) $row->qtd,
                        'perc' => (int) round($row->qtd * 100 / $total),
                    ];
                }
            }
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'emAndamento' => $emAndamento,
            'capacidade' => $capacidade,
            'features' => ['processos' => Schema::hasTable('processos')],
            'capView' => request()->query('cap_view', 'ativos'),
        ]);
    }

    private static function utf8($s)
    {
        if ($s === null) return null;
        if (is_string($s) && mb_check_encoding($s, 'UTF-8')) return $s;
        if (is_string($s)) {
            $try = @iconv('ISO-8859-1', 'UTF-8//IGNORE', $s);
            if ($try !== false) return $try;
            $try2 = @iconv('UTF-8', 'UTF-8//IGNORE', $s);
            if ($try2 !== false) return $try2;
        }
        return is_string($s) ? (string) $s : $s;
    }
}
