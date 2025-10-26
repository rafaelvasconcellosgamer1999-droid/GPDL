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
            'vencidos' => 0,
            'finalizados7d' => 0,
        ];

        $emAndamento = [];
        $capacidade = [];

        if (Schema::hasTable('processos')) {
            $capView = strtolower(request()->query('cap_view', 'ativos'));
            $finishedFlag = function ($q) {
                // Constrói de forma defensiva, só usando colunas existentes
                $hasAny = false;
                if (Schema::hasColumn('processos', 'status')) {
                    $q->whereIn(DB::raw("LOWER(status)"), ['finalizado','concluido','fechado']);
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
                // Se nenhuma coluna conhecida existir, não adiciona condição (evita SQL inválido)
            };

            $ativosQuery = DB::table('processos');
            $ativosQuery->whereNot(function ($q) use ($finishedFlag) { $finishedFlag($q); });
            $stats['ativos'] = (int) $ativosQuery->count();

            $vencidosQuery = DB::table('processos');
            $vencidosQuery->whereNot(function ($q) use ($finishedFlag) { $finishedFlag($q); });
            foreach (['vencimento','prazo','data_limite'] as $deadlineCol) {
                if (Schema::hasColumn('processos', $deadlineCol)) {
                    $vencidosQuery->where($deadlineCol, '<', now());
                    break;
                }
            }
            $stats['vencidos'] = (int) $vencidosQuery->count();

            $finalizadosQuery = DB::table('processos');
            $finalizadosQuery->where(function ($q) use ($finishedFlag) { $finishedFlag($q); });
            if (Schema::hasColumn('processos', 'finalizado_em')) {
                $finalizadosQuery->where('finalizado_em', '>=', now()->subDays(7));
            } elseif (Schema::hasColumn('processos', 'data_finalizacao')) {
                $finalizadosQuery->where('data_finalizacao', '>=', now()->subDays(7));
            } elseif (Schema::hasColumn('processos', 'updated_at')) {
                $finalizadosQuery->where('updated_at', '>=', now()->subDays(7));
            }
            $stats['finalizados7d'] = (int) $finalizadosQuery->count();

             = DB::table('processos');
            // Apenas em andamento ATIVOS: n�o finalizados e com prazo futuro (se houver coluna de prazo)
            ->whereNot(function () use () { (); });
            if (Schema::hasColumn('processos', 'data_limite')) {
                 = now();
                ->whereNotNull('data_limite')->where('data_limite', '>', );
            }
            $listQuery->whereNot(function ($q) use ($finishedFlag) { $finishedFlag($q); });
            foreach (['updated_at','created_at','id'] as $orderCol) {
                if (Schema::hasColumn('processos', $orderCol)) { $listQuery->orderByDesc($orderCol); break; }
            }
            $rows = $listQuery->limit(4)->get();
            foreach ( as ) {  = ->titulo ?? (->assunto ?? 'Processo');
                [] = [
                    'titulo' => ,
                    'entidade' => ->entidade ?? null,
                    'responsavel' => ->responsavel ?? null,
                    'vencimento' => ->vencimento ?? (->prazo ?? (->data_limite ?? null)),
                ];
            }

            $respCol = null;
            foreach (['procurador_responsavel_id','responsavel_id','usuario_id','user_id','responsavel'] as $c) {
                if (Schema::hasColumn('processos', $c)) { $respCol = $c; break; }
            }
            if ($respCol) {
                $q = DB::table('processos')->select($respCol.' as resp', DB::raw('count(*) as qtd'));
                if ($capView === 'encerrados') {
                    $q->where(function ($q2) use ($finishedFlag) { $finishedFlag($q2); });
                } else {
                    $q->whereNot(function ($q2) use ($finishedFlag) { $finishedFlag($q2); });
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

                // Tenta resolver nomes reais dos responsáveis quando a coluna é um ID
                $namesById = [];
                if (in_array($respCol, ['procurador_responsavel_id','responsavel_id','usuario_id','user_id'])) {
                    $ids = $base->pluck('resp')->filter(fn($v) => !is_null($v))->unique()->values();
                    if ($ids->count() > 0 && Schema::hasTable('usuarios')) {
                        $users = DB::table('usuarios')->whereIn('id', $ids)->get(['id','nome']);
                        foreach ($users as $u) { $namesById[$u->id] = $u->nome; }
                    }
                }

                foreach ($base as $row) {
                    $nome = null;
                    if (!empty($namesById) && isset($namesById[$row->resp])) {
                        $nome = $namesById[$row->resp];
                    } elseif (is_string($row->resp)) {
                        $nome = $row->resp;
                    } else {
                        $nome = 'ID '.$row->resp;
                    }

                    // Sigla a partir do nome quando possível
                    $sigla = 'ID';
                    if (is_string($nome) && $nome !== '') {
                        $parts = preg_split('/\s+/', trim($nome));
                        $sigla = strtoupper((mb_substr($parts[0] ?? '',0,1)).(mb_substr($parts[1] ?? '',0,1)));
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
        } else {
            // Sem tabela de processos: manter cartões zerados para evitar confusão
            $stats['ativos'] = 0;
            $stats['vencidos'] = 0;
            $stats['finalizados7d'] = 0;

            $emAndamento = [];

            // Opcional: mostrar capacidade com usuários ativos (zerados)
            $usuarios = DB::table('usuarios')->select('nome')->where('status',1)->limit(2)->get();
            foreach ($usuarios as $u) {
                $parts = preg_split('/\s+/', $u->nome);
                $sigla = '';
                if (is_array($parts)) {
                    $sigla = strtoupper(mb_substr($parts[0] ?? '',0,1).mb_substr($parts[1] ?? '',0,1));
                }
                $capacidade[] = [
                    'sigla' => $sigla ?: 'US',
                    'nome' => $u->nome,
                    'ativos' => 0,
                    'perc' => 0,
                ];
            }
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'emAndamento' => $emAndamento,
            'capacidade' => $capacidade,
            'features' => [ 'processos' => Schema::hasTable('processos') ],
            'capView' => ($capView ?? 'ativos'),
        ]);
    }
}

\n\n    private function sanitizeUtf8(\) {\n        if (\ === null) return null;\n        if (is_string(\) && mb_check_encoding(\, 'UTF-8')) return \;\n        if (is_string(\)) {\n            \ = @iconv('ISO-8859-1', 'UTF-8//IGNORE', \);\n            if (\ !== false) return \;\n            \ = @iconv('UTF-8', 'UTF-8//IGNORE', \);\n            if (\ !== false) return \;\n        }\n        return is_string(\) ? (string) \ : \;\n    }\n

