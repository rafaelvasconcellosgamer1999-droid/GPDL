<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

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
     * Importa processos em lote a partir de um texto colado.
     */
    public function importarLote(Request $request)
    {
        $data = $request->validate([
            'responsavel_id' => ['required', 'integer', 'exists:usuarios,id'],
            'assunto' => ['nullable', 'string', 'max:180'],
            'texto' => ['required', 'string'],

            'modelo' => ['nullable', 'string', 'in:pje'],
        ]);

        $usuario = Auth::user();
        // setor_id deve seguir o setor do procurador responsável escolhido no formulário
        $responsavel = \App\Models\User::find($data['responsavel_id']);
        $setorId = optional($responsavel)->setor_id;

        $blocos = $this->separarBlocos($data['texto']);

        $inseridos = 0;
        DB::transaction(function () use ($blocos, $data, $usuario, $setorId, &$inseridos) {
            foreach ($blocos as $bloco) {
                $modeloSel = strtolower($data['modelo'] ?? 'pje');
                switch ($modeloSel) {
                    case 'pje':
                    default:
                        $parsed = $this->parsePublicacaoLote($bloco);
                        break;
                }

                // Se o parser extraiu um data_limite igual à data_ciencia, trata como sem prazo de manifestação
                if (!empty($parsed['limite']) && !empty($parsed['ciencia'])) {
                    try {
                        $lim = $parsed['limite'] instanceof Carbon ? $parsed['limite'] : Carbon::parse($parsed['limite']);
                        $cin = $parsed['ciencia'] instanceof Carbon ? $parsed['ciencia'] : Carbon::parse($parsed['ciencia']);
                        if ($lim->format('Y-m-d H:i') === $cin->format('Y-m-d H:i')) {
                            $parsed['limite'] = null;
                        }
                    } catch (\Throwable $e) {
                    }
                }

                Processo::create([
                    'orgao' => $parsed['orgao'] ?? null,
                    'acao' => $parsed['acao'] ?? null,
                    'numero' => $parsed['numero'] ?? null,
                    'assunto' => $data['assunto'] ?: ($parsed['assunto'] ?? null),
                    'partes_envolvidas' => $parsed['partes'] ?? null,
                    'vara_juizo' => $parsed['vara'] ?? null,
                    'procurador_responsavel_id' => $data['responsavel_id'],
                    'usuario_cadastro_id' => optional($usuario)->id,
                    'data_ciencia' => $parsed['ciencia'] ?? null,
                    'data_limite' => $parsed['limite'] ?? null,
                    'ultimo_mov_texto' => $parsed['movimento'] ?? null,
                    'ultimo_mov_data' => $parsed['mov_data'] ?? null,
                    'origem_cadastro' => 'importacao_lote',
                    'setor_id' => $setorId,
                    'data_entrada' => now(),
                ]);

                $inseridos++;
            }
        });

        return redirect()->to('/processos?view=cadastro')
            ->with('success', $inseridos . ' processo(s) importado(s) com sucesso.');
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


    private function separarBlocos(string $texto): array
    {
        // Normaliza quebras de linha e separa por linhas em branco duplas
        $t = str_replace(["\r\n", "\r"], "\n", trim($texto));
        $parts = preg_split("/\n{2,}/", $t) ?: [];

        // Fallback: se não houve separação, usa o texto inteiro
        if (count($parts) === 0) {
            $parts = [$t];
        }

        // Remove blocos muito pequenos (ruído)
        return array_values(array_filter(array_map('trim', $parts), function ($p) {
            return mb_strlen($p) > 3;
        }));
    }

    private function extrairNumeroProcesso(string $texto): ?string
    {
        // Padrão CNJ: 0001234-56.2023.8.26.0100
        $padroes = [
            '/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/u',
            '/\b\d{20,25}\b/u', // apenas dígitos longos
        ];

        foreach ($padroes as $rx) {
            if (preg_match($rx, $texto, $m)) {
                return $m[0];
            }
        }
        return null;
    }

    private function extrairAssunto(string $texto): string
    {
        // Usa a primeira linha como assunto, limitado a 180 chars
        $linha1 = trim(strtok($texto, "\n"));
        $linha1 = preg_replace('/\s+/', ' ', $linha1);
        return mb_substr($linha1 ?: 'Processo importado', 0, 180);
    }

    private function extrairPartes(string $texto): ?string
    {
        // Heurística simples: retorna as 10 primeiras linhas como contexto
        $linhas = preg_split('/\n/', trim($texto)) ?: [];
        $trecho = implode("\n", array_slice($linhas, 0, 10));
        return $trecho ?: null;
    }

    /**
     * Parser aproximado baseado nos exemplos de publicação enviados.
     * Não calcula prazo: usa as datas já presentes no texto.
     */
    private function parsePublicacaoLote(string $texto): array
    {
        $t = trim(preg_replace('/\r\n?/', "\n", $texto));
        $out = ['numero' => $this->extrairNumeroProcesso($t)];

        // Órgão: primeira linha
        $linhas = preg_split('/\n+/', $t) ?: [];
        if (!empty($linhas)) {
            $primeira = trim($linhas[0]);
            if ($primeira !== '') $out['orgao'] = $primeira;
        }

        // Ação
        if (preg_match('/^\s*(Decisão|Intimação|Sentença|Despacho|Citação|Notificação|Ato\s+Ordinatório|Juntada|Distribuição|Conclusão|Conclusões)\b(?:[^\n]*?\((\d+)\))?/miu', $t, $m)) {
            $out['acao'] = isset($m[2]) && $m[2] !== '' ? ($m[1] . ' (' . $m[2] . ')') : $m[1];
        }

        // Assunto: após o CNJ na mesma linha
        if (!empty($out['numero']) && preg_match('/' . preg_quote($out['numero'], '/') . '\s*([^\n]+)/u', $t, $m)) {
            $poss = trim($m[1]);
            if ($poss !== '') $out['assunto'] = $poss;
        }
        if (empty($out['assunto'])) {
            foreach ($linhas as $ln) {
                $s = trim($ln);
                if ($s === '') continue;
                if (preg_match('/\b(IPTU|ISS|Invent[áa]rio|Partilha|Tribut[áa]rio|Municipais?)\b/iu', $s)) {
                    $out['assunto'] = $s;
                    break;
                }
            }
        }

        // Partes
        if (preg_match('/^(.+?)\s+X\s+(.+)$/mi', $t, $m)) {
            $out['partes'] = trim($m[1] . ' X ' . $m[2]);
        }

        // Vara/Juízo: linha com "Vara", "Juizado" ou "Turma"
        foreach ($linhas as $ln) {
            if (preg_match('/(\d+ª?\s+Vara[^\n]+|Juizado[^\n]+|Turma[^\n]+)/iu', $ln, $m)) {
                $out['vara'] = trim($m[1]);
                break;
            }
        }

        // Ciência
        if (preg_match('/ci[êe]ncia[^\n]*?([0-3]\d\/[01]\d\/[12]\d{3})(?:\s+(\d{2}:\d{2}))?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['ciencia'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
        } elseif (preg_match('/Expedi[çc][ãa]o\s+eletr[ôo]nica\s*\(([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['ciencia'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
        }

        // Data limite apenas de manifestacao (nao confundir com ciencia)
        if (preg_match('/Data\s+limite[^:]*:\s*([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['limite'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
            // Se a mesma linha de "Data limite" indica ciencia, nao registrar como prazo de manifestacao
            $tPlain = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
            if ($tPlain === false) {
                $tPlain = $t;
            }
            if (preg_match('/Data\s+limite[^\n]*ciencia/iu', $tPlain)) {
                unset($out['limite']);
            }
        }

        // Último movimento
        if (preg_match('/último\s+movimento:\s*([^\n]+)/iu', $t, $m)) {
            $out['movimento'] = trim($m[1]);
            if (preg_match('/([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/', $out['movimento'], $md)) {
                $dt = $md[1] . (isset($md[2]) ? (' ' . $md[2]) : ' 00:00');
                try {
                    $out['mov_data'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
                } catch (\Exception $e) {
                }
            }
        }

        // Fallback de ação caso não tenha sido capturado nos padrões acima
        if (empty($out['acao'])) {
            $tn = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
            if ($tn === false) {
                $tn = $t;
            }
            if (preg_match('/^\s*(Decisao|Intimacao|Sentenca|Despacho|Citacao|Notificacao|Ato\s+Ordinatorio|Juntada|Distribuicao|Conclusao|Conclusoes)\b/mi', $tn, $mm)) {
                $out['acao'] = $mm[1];
            }
        }
        return $out;
    }
}
