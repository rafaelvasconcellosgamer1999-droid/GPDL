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

            $listQuery = DB::table('processos');
            $listQuery->whereNot(function ($q) use ($finishedFlag) { $finishedFlag($q); });
            foreach (['updated_at','created_at','id'] as $orderCol) {
                if (Schema::hasColumn('processos', $orderCol)) { $listQuery->orderByDesc($orderCol); break; }
            }
            $rows = $listQuery->limit(4)->get();
            foreach ($rows as $row) {
                $emAndamento[] = [
                    'titulo' => $row->titulo ?? ($row->assunto ?? 'Processo'),
                    'entidade' => $row->entidade ?? null,
                    'responsavel' => $row->responsavel ?? null,
                    'vencimento' => $row->vencimento ?? ($row->prazo ?? ($row->data_limite ?? null)),
                ];
            }

            $respCol = null;
            foreach (['procurador_responsavel_id','responsavel_id','usuario_id','user_id','responsavel'] as $c) {
                if (Schema::hasColumn('processos', $c)) { $respCol = $c; break; }
            }
            if ($respCol) {
                $base = DB::table('processos')->select($respCol.' as resp', DB::raw('count(*) as qtd'))
                    ->whereNot(function ($q) use ($finishedFlag) { $finishedFlag($q); })
                    ->groupBy('resp')->get();
                $total = max(1, $base->sum('qtd'));
                foreach ($base as $row) {
                    $capacidade[] = [
                        'sigla' => is_string($row->resp) ? strtoupper(substr($row->resp,0,2)) : 'ID',
                        'nome' => (string) $row->resp,
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
        ]);
    }
}
