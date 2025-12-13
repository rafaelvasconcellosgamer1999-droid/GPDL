<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ProcessoController extends Controller
{
    /**
     * Página de Processos (lista conforme a view).
     */
    public function index(Request $request): Response
    {
        $view = strtolower($request->query('view', 'cadastro'));
        $lista = [];

        if (Schema::hasTable('processos')) {
            $finishedFlag = function ($q) {
                $hasAny = false;
                // coluna 'status' descontinuada
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
                }
            };

            $select = ['processos.id'];
            $hasDataLimite = false;
            $hasDataCiencia = false;

            foreach (
                [
                    'orgao',
                    'acao',
                    'numero',
                    'assunto',
                    'partes_envolvidas',
                    'vara_juizo',
                    'data_limite',
                    'data_ciencia',
                    'ultimo_mov_texto',
                    'ultimo_mov_data',
                    'updated_at',
                    'created_at',
                    'procurador_responsavel_id'
                ] as $c
            ) {
                if (!Schema::hasColumn('processos', $c)) {
                    continue;
                }
                if ($c === 'data_limite') {
                    $hasDataLimite = true;
                    continue;
                }
                if ($c === 'data_ciencia') {
                    $hasDataCiencia = true;
                    continue;
                }
                $select[] = 'processos.' . $c;
            }

            if ($hasDataLimite) {
                $select[] = DB::raw("CASE WHEN processos.data_limite IS NULL THEN NULL ELSE REPLACE(processos.data_limite, ' ', 'T') END as data_limite");
            }
            if ($hasDataCiencia) {
                $select[] = DB::raw("CASE WHEN processos.data_ciencia IS NULL THEN NULL ELSE REPLACE(processos.data_ciencia, ' ', 'T') END as data_ciencia");
            }

            $q = DB::table('processos')
                ->select(array_merge($select, ['u.nome as responsavel_nome']))
                ->leftJoin('usuarios as u', function ($join) {
                    $join->on('u.id', '=', 'processos.procurador_responsavel_id');
                });

            $responsavelId = (int) $request->query('responsavel_id');
            if ($responsavelId > 0) {
                $q->where('processos.procurador_responsavel_id', $responsavelId);
            }

            switch ($view) {
                case 'encerrados':
                    $q->where(function ($q2) use ($finishedFlag) {
                        $finishedFlag($q2);
                    });
                    break;

                case 'pendentes':
                    $q->whereNot(function ($q2) use ($finishedFlag) {
                        $finishedFlag($q2);
                    });
                    if (Schema::hasColumn('processos', 'data_limite')) {
                        $q->whereNull('processos.data_limite');
                    }
                    break;

                case 'ativos':
                    $q->whereNot(function ($q2) use ($finishedFlag) {
                        $finishedFlag($q2);
                    });
                    if (Schema::hasColumn('processos', 'data_limite')) {
                        $now = now();
                        $q->whereNotNull('processos.data_limite')
                            ->where('processos.data_limite', '>', $now);
                    }
                    break;

                case 'vencidos':
                    $q->whereNot(function ($q2) use ($finishedFlag) {
                        $finishedFlag($q2);
                    });
                    if (Schema::hasColumn('processos', 'data_limite')) {
                        $now = now();
                        $q->whereNotNull('processos.data_limite')
                            ->where('processos.data_limite', '<=', $now);
                    }
                    break;

                default:
                    $q = null;
            }

            if ($q) {
                $order = $request->query('order', 'prazo_asc');
                if ($order === 'prazo_asc' && Schema::hasColumn('processos', 'data_limite')) {
                    $q->orderByRaw('CASE WHEN processos.data_limite IS NULL THEN 1 ELSE 0 END ASC')
                        ->orderBy('processos.data_limite', 'asc');
                } else {
                    foreach (['updated_at', 'created_at', 'id'] as $orderCol) {
                        if (Schema::hasColumn('processos', $orderCol)) {
                            $q->orderByDesc($orderCol);
                            break;
                        }
                    }
                }

                $perPage = max(5, min(100, (int) $request->query('per_page', 10)));
                $lista = $q->paginate($perPage)->appends($request->query());
            }
        }

        $procuradores = \App\Models\User::ativos()->orderBy('nome')->get(['id', 'nome']);

        return Inertia::render('Processos/Index', [
            'procuradores' => $procuradores,
            'processos' => $lista,
            'filters' => [
                'responsavel_id' => $request->query('responsavel_id', null) ?? '',
                'order' => $request->query('order', 'prazo_asc'),
                'per_page' => (int) $request->query('per_page', 10),
                'view' => $view,
            ],
        ]);
    }

    /**
     * Finaliza um processo individual (marca como encerrado nos campos disponíveis).
     */
    public function finalizar(Request $request, int $id)
    {
        if (!Schema::hasTable('processos')) {
            return back()->with('error', 'Tabela de processos não encontrada.');
        }

        $updates = [];
        $agora = now();
        if (Schema::hasColumn('processos', 'data_finalizacao')) {
            $updates['data_finalizacao'] = $agora;
        }
        if (Schema::hasColumn('processos', 'finalizado_em')) {
            $updates['finalizado_em'] = $agora;
        }
        if (Schema::hasColumn('processos', 'concluido')) {
            $updates['concluido'] = 1;
        }

        if (empty($updates)) {
            return back()->with('error', 'Não há colunas de finalização disponíveis.');
        }

        DB::table('processos')->where('id', $id)->update($updates);

        return back()->with('success', 'Processo finalizado com sucesso.');
    }
}
