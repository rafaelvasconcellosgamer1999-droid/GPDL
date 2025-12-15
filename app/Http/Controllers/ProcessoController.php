<?php

namespace App\Http\Controllers;

use App\Models\Processos;
use App\Models\User;
use App\Models\Partes;
use App\Http\Resources\ProcessoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class ProcessoController extends Controller
{
    private int $cargo_procurador = 3;

    // =========================================================================
    //  MÉTODOS DE LISTAGEM (NOVAS ROTAS)
    // =========================================================================

    public function ativos(Request $request): Response
    {
        $query = $this->buildBaseQuery($request);

        // Lógica: NÃO finalizado E (Data Limite Futura OU Sem Data Limite definida como regra de ativo)
        // Na sua lógica original: "ativos" eram aqueles com Data Limite > Agora.
        $this->applyNotFinished($query);

        if (Schema::hasColumn('processos', 'data_limite')) {
            $now = now();
            $query->whereNotNull('processos.data_limite')
                ->where('processos.data_limite', '>', $now);
        }

        return Inertia::render('Processos/Lote/Ativos', $this->packResponse($query, $request));
    }

    public function pendentes(Request $request): Response
    {
        $query = $this->buildBaseQuery($request);

        // Lógica: NÃO finalizado E Sem Data Limite
        $this->applyNotFinished($query);

        if (Schema::hasColumn('processos', 'data_limite')) {
            $query->whereNull('processos.data_limite');
        }

        return Inertia::render('Processos/Lote/Pendentes', $this->packResponse($query, $request));
    }

    public function vencidos(Request $request): Response
    {
        $query = $this->buildBaseQuery($request);

        // Lógica: NÃO finalizado E Data Limite Passada
        $this->applyNotFinished($query);

        if (Schema::hasColumn('processos', 'data_limite')) {
            $now = now();
            $query->whereNotNull('processos.data_limite')
                ->where('processos.data_limite', '<=', $now);
        }

        return Inertia::render('Processos/Lote/Vencidos', $this->packResponse($query, $request));
    }

    public function encerrados(Request $request): Response
    {
        $query = $this->buildBaseQuery($request);

        // Lógica: Finalizado
        $this->applyFinished($query);

        return Inertia::render('Processos/Lote/Encerrados', $this->packResponse($query, $request));
    }

    public function distribuicao(Request $request): Response
    {
        $query = $this->buildBaseQuery($request);

        // Lógica: Pode ser todos os ativos ou uma lógica específica de distribuição
        // Por padrão, vamos mostrar os não finalizados
        $this->applyNotFinished($query);

        return Inertia::render('Processos/Lote/Distribuicao', $this->packResponse($query, $request));
    }

    // =========================================================================
    //  HELPERS DE QUERY (Extraídos do seu antigo index)
    // =========================================================================

    /**
     * Monta a query base com Selects dinâmicos e Joins
     */
    private function buildBaseQuery(Request $request)
    {
        // 1. Definição de colunas dinâmicas
        $select = ['processos.id'];
        $hasDataLimite = false;
        $hasDataCiencia = false;

        $columnsToCheck = [
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
            'procurador_responsavel_id',
            // --- CORREÇÃO: ADICIONE ESTAS LINHAS AQUI ---
            'data_finalizacao',
            'finalizado_em',
            'concluido'
            // --------------------------------------------
        ];

        foreach ($columnsToCheck as $c) {
            // Verifica se a coluna existe no banco antes de tentar selecionar
            if (!Schema::hasColumn('processos', $c)) continue;

            if ($c === 'data_limite') {
                $hasDataLimite = true;
                continue; // Tratamento especial abaixo
            }
            if ($c === 'data_ciencia') {
                $hasDataCiencia = true;
                continue; // Tratamento especial abaixo
            }
            $select[] = 'processos.' . $c;
        }

        if ($hasDataLimite) {
            $select[] = DB::raw("CASE WHEN processos.data_limite IS NULL THEN NULL ELSE REPLACE(processos.data_limite, ' ', 'T') END as data_limite");
        }
        if ($hasDataCiencia) {
            $select[] = DB::raw("CASE WHEN processos.data_ciencia IS NULL THEN NULL ELSE REPLACE(processos.data_ciencia, ' ', 'T') END as data_ciencia");
        }

        // 2. Query Builder Base
        $q = DB::table('processos')
            ->select(array_merge($select, ['u.nome as responsavel_nome']))
            ->leftJoin('usuarios as u', function ($join) {
                $join->on('u.id', '=', 'processos.procurador_responsavel_id');
            });

        // 3. Filtros Comuns
        $responsavelId = (int) $request->query('responsavel_id');
        if ($responsavelId > 0) {
            $q->where('processos.procurador_responsavel_id', $responsavelId);
        }

        // 4. Ordenação
        $order = $request->query('order', 'prazo_asc');
        if ($order === 'prazo_asc' && $hasDataLimite) {
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

        return $q;
    }

    /**
     * Empacota os dados para o Inertia (Paginação + Props comuns)
     */
    private function packResponse($query, Request $request): array
    {
        $perPage = max(5, min(100, (int) $request->query('per_page', 10)));
        $lista = $query->paginate($perPage)->appends($request->query());

        // Carrega dados auxiliares para os filtros
        $procuradores = User::ativos()->orderBy('nome')->get(['id', 'nome']);

        // Exemplo de setores (se existir)
        // $setores = ...

        return [
            'processos' => $lista,
            'filters' => $request->all(),
            'procuradores' => $procuradores,
            'setorSelecionado' => session('setorSelecionado', null),
        ];
    }

    private function applyFinished($q)
    {
        $q->where(function ($query) {
            $hasAny = false;
            if (Schema::hasColumn('processos', 'concluido')) {
                $query->orWhere('concluido', 1);
                $hasAny = true;
            }
            if (Schema::hasColumn('processos', 'finalizado_em')) {
                $method = $hasAny ? 'orWhereNotNull' : 'whereNotNull';
                $query->{$method}('finalizado_em');
                $hasAny = true;
            }
            if (Schema::hasColumn('processos', 'data_finalizacao')) {
                $method = $hasAny ? 'orWhereNotNull' : 'whereNotNull';
                $query->{$method}('data_finalizacao');
            }
            // Se não tiver nenhuma coluna de finalização, essa query pode ficar vazia, 
            // então cuidado. Mas baseado no seu código anterior, assume-se que as colunas existem.
        });
    }

    private function applyNotFinished($q)
    {
        $q->where(function ($query) {
            // Lógica inversa: garante que NÃO satisfaz nenhuma condição de finalizado
            // Como é um "NOT (A OR B)", vira "NOT A AND NOT B"
            if (Schema::hasColumn('processos', 'concluido')) {
                $query->where('concluido', '!=', 1)
                    ->orWhereNull('concluido');
            }
            if (Schema::hasColumn('processos', 'finalizado_em')) {
                $query->whereNull('finalizado_em');
            }
            if (Schema::hasColumn('processos', 'data_finalizacao')) {
                $query->whereNull('data_finalizacao');
            }
        });
    }

    // =========================================================================
    //  AÇÕES DE ESCRITA E UTILITÁRIOS (Mantidos do original)
    // =========================================================================

    public function setSetor(Request $request)
    {
        $data = $request->validate(['setor' => 'nullable|string']);
        session(['setorSelecionado' => $data['setor'] ?? null]);
    }

    public function create()
    {
        $procuradores = User::ativos()
            ->where('cargo_id', $this->cargo_procurador)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        $setores = [];
        if (Schema::hasTable('setores')) {
            $setores = DB::table('setores')->select('id', 'nome')->orderBy('nome')->get()->map(function ($s) {
                return ['id' => $s->id, 'nome' => $s->nome];
            })->toArray();
        } else {
            $setores = [
                ['id' => 'contencioso', 'nome' => 'Contencioso'],
                ['id' => 'previdencia',  'nome' => 'Previdência'],
                ['id' => 'administrativo', 'nome' => 'Administrativo'],
                ['id' => 'tributario',   'nome' => 'Tributário'],
            ];
        }

        return Inertia::render('Processos/Individual/CadastroIndividual', [
            'procuradores' => $procuradores,
            'setores' => $setores,
            'setorSelecionado' => session('setorSelecionado', null),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'instancia' => ['nullable', 'string', 'max:50'],
            'tribunal' => ['nullable', 'integer', 'exists:entidades_juridicas,id'],
            'valor_causa' => ['nullable', 'string'],
            'numero_processo' => ['nullable', 'string', 'max:50'],
            'tipo_processo' => ['nullable', 'string', 'max:100'],
            'tipo_pagamento' => ['nullable', 'string', 'in:precatorio,rpv'],
            'acao' => ['nullable', 'integer', 'exists:tematicas,id'],
            'assunto' => ['nullable', 'integer', 'exists:tematicas,id'],
            'orgao_origem' => ['nullable', 'integer', 'exists:entidades_juridicas,id'],
            'orgao_julgador' => ['nullable', 'integer', 'exists:entidades_juridicas,id'],
            'numero_agravo' => ['nullable', 'string', 'max:50'],
            'numero_suspensao' => ['nullable', 'string', 'max:50'],
            'numero_protocolo' => ['nullable', 'string', 'max:50'],
            'tipo_distribuicao' => ['nullable', 'string'],
            'motivo_distribuicao' => ['nullable', 'string'],
            'procurador_responsavel_id' => ['required', 'integer', 'exists:usuarios,id'],
            'incidencia' => ['nullable'],
            'referencia_numero_processo' => ['nullable', 'string', 'max:50'],
            // Validação de partes
            'partes' => ['nullable', 'array'],
            'partes.*.nome' => ['required', 'string'],
            'partes.*.cpf' => ['nullable', 'string'],
            'partes.*.qualificacao' => ['nullable', 'string'],
            'partes.*.tipo_qualificacao' => ['nullable', 'string'],
            'partes.*.eh_principal' => ['nullable'],
            'partes.*.expediente' => ['nullable'],
            'partes.*.parte_id' => ['nullable'],
        ]);

        $usuario = Auth::user();

        $processo = Processos::create([
            'area_atuacao' => Session::get('setorSelecionado', null),
            'municipio' => 'Belém',
            'instancia' => $data['instancia'] ?? null,
            'tribunal_id' => $data['tribunal'] ?? null,
            'valor_causa' => $data['valor_causa'] ? str_replace(['R$', ' ', ','], ['', '', '.'], $data['valor_causa']) : null,
            'cnj' => $data['numero_processo'] ?? null,
            'tipo_processo' => $data['tipo_processo'] ?? null,
            'tipo_pagamento' => $data['tipo_pagamento'] ?? null,
            'acao_id' => $data['acao'] ?? null,
            'assunto_id' => $data['assunto'] ?? null,
            'orgao_origem_id' => $data['orgao_origem'] ?? null,
            'orgao_julgador_id' => $data['orgao_julgador'] ?? null,
            'numero_agravo' => $data['numero_agravo'] ?? null,
            'numero_suspensao' => $data['numero_suspensao'] ?? null,
            'numero_protocolo' => $data['numero_protocolo'] ?? null,
            'tipo_distribuicao' => $data['tipo_distribuicao'] ?? null,
            'motivo_distribuicao' => $data['motivo_distribuicao'] ?? null,
            'procurador_responsavel_id' => $data['procurador_responsavel_id'],
            'usuario_cadastro_id' => optional($usuario)->id,
        ]);

        if (($data['incidencia'] ?? '0') == '1' && !empty($data['referencia_numero_processo'])) {
            $processoRef = Processos::where('cnj', $data['referencia_numero_processo'])->first();
            if ($processoRef) {
                $processo->update(['processo_ref_id' => $processoRef->id]);
            }
        }

        if (!empty($data['partes'])) {
            foreach ($data['partes'] as $parte) {
                $parteId = $parte['parte_id'] ?? null;
                if ($parteId && !Partes::find($parteId)) $parteId = null;
                if (!$parteId && !empty($parte['cpf'])) {
                    $match = Partes::where('cpf_cnpj', $parte['cpf'])->first();
                    if ($match) $parteId = $match->id;
                }
                if (!$parteId && !empty($parte['nome'])) {
                    $match = Partes::where('nome', $parte['nome'])->first();
                    if ($match) $parteId = $match->id;
                }
                if (!$parteId) {
                    $new = Partes::create([
                        'nome' => $parte['nome'] ?? null,
                        'cpf_cnpj' => $parte['cpf'] ?? null,
                        'tipo_parte' => $parte['tipo_qualificacao'] ?? null,
                    ]);
                    $parteId = $new->id;
                }
                $ehPrincipal = isset($parte['eh_principal']) && (string)$parte['eh_principal'] === '1' ? 1 : 0;
                $expediente = isset($parte['expediente']) && (string)$parte['expediente'] === '1' ? 1 : 0;

                $processo->partes()->attach($parteId, [
                    'qualificacao' => $parte['qualificacao'] ?? null,
                    'tipo_qualificacao' => $parte['tipo_qualificacao'] ?? null,
                    'parte_principal' => $ehPrincipal,
                    'expediente' => $expediente,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return redirect()->to('/processos/cadastro')
            ->with('success', 'Processo cadastrado com sucesso.');
    }

    public function createLote()
    {
        $procuradores = User::ativos()->orderBy('nome')->get(['id', 'nome']);
        // Mesma lógica de setores se precisar
        $setores = []; // Simplificado aqui para brevidade

        return Inertia::render('Processos/Lote/CadastroLote', [
            'procuradores' => $procuradores,
            'setores' => $setores,
            'setorSelecionado' => session('setorSelecionado', null),
        ]);
    }

    public function importarLote(Request $request)
    {
        $data = $request->validate([
            'responsavel_id' => ['required', 'integer', 'exists:usuarios,id'],
            'assunto' => ['nullable', 'string', 'max:180'],
            'texto' => ['required', 'string'],
            'modelo' => ['nullable', 'string', 'in:pje'],
        ]);

        $usuario = Auth::user();
        $responsavel = User::find($data['responsavel_id']);
        $setorId = optional($responsavel)->setor_id;

        $blocos = $this->separarBlocos($data['texto']);
        $inseridos = 0;

        DB::transaction(function () use ($blocos, $data, $usuario, $setorId, &$inseridos) {
            foreach ($blocos as $bloco) {
                $parsed = $this->parsePublicacaoLote($bloco);

                // Tratamento de prazo vs ciencia
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

                Processos::create([
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

        return redirect()->to('/processos/cadastro')
            ->with('success', $inseridos . ' processo(s) importado(s) com sucesso.');
    }

    public function finalizar(Request $request, int $id)
    {
        if (!Schema::hasTable('processos')) {
            return back()->with('error', 'Tabela não encontrada.');
        }

        $updates = [];
        $agora = now();
        if (Schema::hasColumn('processos', 'data_finalizacao')) $updates['data_finalizacao'] = $agora;
        if (Schema::hasColumn('processos', 'finalizado_em')) $updates['finalizado_em'] = $agora;
        if (Schema::hasColumn('processos', 'concluido')) $updates['concluido'] = 1;

        if (empty($updates)) {
            return back()->with('error', 'Sem colunas de finalização.');
        }

        DB::table('processos')->where('id', $id)->update($updates);
        return back()->with('success', 'Processo finalizado com sucesso.');
    }

    public function visualizar(Request $request)
    {
        $initial = Processos::with(['tribunal', 'acao', 'assunto', 'procuradorResponsavel'])
            ->limit(20)->get();

        return Inertia::render('Processos/Individual/Visualizar', [
            'initialProcesses' => $initial,
            'fetchUrl' => url('/api/processos'),
        ]);
    }

    // =========================================================================
    //  API e HELPERS PRIVADOS (Mantidos)
    // =========================================================================

    public function apiIndex(Request $request)
    {
        $modelInstance = new Processos();
        $q = Processos::query()
            ->with(['tribunal:id,nome', 'acao:id,nome', 'assunto:id,nome', 'procuradorResponsavel:id,nome']);

        if (method_exists($modelInstance, 'andamentos')) $q->withCount('andamentos');
        if (method_exists($modelInstance, 'incidencias')) $q->withCount('incidencias');

        $search = trim((string) $request->query('q', ''));
        if ($search !== '') {
            $q->where(function (Builder $qq) use ($search) {
                $qq->where('cnj', 'like', "%{$search}%")
                    ->orWhere('municipio', 'like', "%{$search}%")
                    ->orWhereHas('acao', fn($r) => $r->where('nome', 'like', "%{$search}%"))
                    ->orWhereHas('assunto', fn($r) => $r->where('nome', 'like', "%{$search}%"));
            });
        }

        $responsavelId = (int) $request->query('responsavel_id', 0);
        if ($responsavelId > 0) $q->where('procurador_responsavel_id', $responsavelId);

        if (Schema::hasColumn($modelInstance->getTable(), 'data_limite')) {
            $q->orderByRaw('CASE WHEN data_limite IS NULL THEN 1 ELSE 0 END ASC')
                ->orderBy('data_limite', 'asc');
        } else {
            $q->orderByDesc('id');
        }

        $paginator = $q->paginate(max(5, min(100, (int) $request->query('per_page', 12))))
            ->appends($request->query());

        return ProcessoResource::collection($paginator)
            ->additional(['meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ]]);
    }

    public function apiShow(Request $request, $id)
    {
        $modelInstance = new Processos();
        $with = ['tribunal:id,nome', 'acao:id,nome', 'assunto:id,nome', 'procuradorResponsavel:id,nome'];
        if (method_exists($modelInstance, 'andamentos')) $with[] = 'andamentos';
        if (method_exists($modelInstance, 'incidencias')) $with[] = 'incidencias';

        $processo = Processos::with($with)->find($id);
        if (!$processo) return response()->json(['message' => 'Processo não encontrado.'], 404);

        return new ProcessoResource($processo);
    }

    private function separarBlocos(string $texto): array
    {
        $t = str_replace(["\r\n", "\r"], "\n", trim($texto));
        $parts = preg_split("/\n{2,}/", $t) ?: [];
        if (count($parts) === 0) $parts = [$t];
        return array_values(array_filter(array_map('trim', $parts), fn($p) => mb_strlen($p) > 3));
    }

    private function extrairNumeroProcesso(string $texto): ?string
    {
        $padroes = ['/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/u', '/\b\d{20,25}\b/u'];
        foreach ($padroes as $rx) {
            if (preg_match($rx, $texto, $m)) return $m[0];
        }
        return null;
    }

    private function parsePublicacaoLote(string $texto): array
    {
        $t = trim(preg_replace('/\r\n?/', "\n", $texto));
        $out = ['numero' => $this->extrairNumeroProcesso($t)];
        $linhas = preg_split('/\n+/', $t) ?: [];
        if (!empty($linhas)) {
            $primeira = trim($linhas[0]);
            if ($primeira !== '') $out['orgao'] = $primeira;
        }
        if (preg_match('/^\s*(Decisão|Intimação|Sentença|Despacho|Citação|Notificação|Ato\s+Ordinatório|Juntada|Distribuição|Conclusão|Conclusões)\b(?:[^\n]*?\((\d+)\))?/miu', $t, $m)) {
            $out['acao'] = isset($m[2]) && $m[2] !== '' ? ($m[1] . ' (' . $m[2] . ')') : $m[1];
        }
        if (!empty($out['numero']) && preg_match('/' . preg_quote($out['numero'], '/') . '\s*([^\n]+)/u', $t, $m)) {
            $out['assunto'] = trim($m[1]);
        }
        if (preg_match('/^(.+?)\s+X\s+(.+)$/mi', $t, $m)) {
            $out['partes'] = trim($m[1] . ' X ' . $m[2]);
        }
        foreach ($linhas as $ln) {
            if (preg_match('/(\d+ª?\s+Vara[^\n]+|Juizado[^\n]+|Turma[^\n]+)/iu', $ln, $m)) {
                $out['vara'] = trim($m[1]);
                break;
            }
        }
        if (preg_match('/ci[êe]ncia[^\n]*?([0-3]\d\/[01]\d\/[12]\d{3})(?:\s+(\d{2}:\d{2}))?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['ciencia'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
        }
        if (preg_match('/Data\s+limite[^:]*:\s*([0-3]\d\/[01]\d\/[12]\d{3})\s*(\d{2}:\d{2})?/iu', $t, $m)) {
            $dt = $m[1] . (isset($m[2]) ? (' ' . $m[2]) : ' 00:00');
            $out['limite'] = Carbon::createFromFormat('d/m/Y H:i', $dt);
        }
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
        return $out;
    }
}
