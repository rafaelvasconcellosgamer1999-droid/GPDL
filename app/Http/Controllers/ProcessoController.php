<?php

namespace App\Http\Controllers;

use App\Models\Processos;
use App\Models\User;
use App\Models\Partes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProcessoController extends Controller
{
    private int $cargo_procurador = 3;

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
        $valorCausaFormatado = null;
        if (!empty($data['valor_causa'])) {

            $valorLimpo = $data['valor_causa'];

            $valorLimpo = str_replace('.', '', $valorLimpo);


            $valorCausaFormatado = str_replace(',', '.', $valorLimpo);


            $valorCausaFormatado = str_replace(['R$', ' '], '', $valorCausaFormatado);


            $valorCausaFormatado = (float) $valorCausaFormatado;
        }
        $processo = Processos::create([
            'area_atuacao' => Session::get('setorSelecionado', null),
            'municipio' => 'Belém',
            'instancia' => $data['instancia'] ?? null,
            'tribunal_id' => $data['tribunal'] ?? null,
            'valor_causa' => $valorCausaFormatado,
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

        return redirect()->to('/processos/novo')
            ->with('success', 'Processo cadastrado com sucesso.');
    }

    public function index(): Response
    {
        $processos = Processos::query()
            ->with([
                'acao:id,nome',
                'assunto:id,nome',
            ])
            ->withCount([
                'andamentos',
                'partes',
                'ramificacoes as incidencias_count',
            ])
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Processos/NovoVisualizador/Index', [
            'processos' => $processos,
        ]);
    }

    public function show(Processos $processo): Response
    {
        $processo->load([
            'acao',
            'assunto',
            'tribunal',
            'entidadeOrigem',
            'entidadeJulgadora',
            'partes',
            'andamentos.cadastradoPor',
            'ramificacoes',
        ]);

        return Inertia::render('Processos/NovoVisualizador/Show', [
            'processo' => $processo,
        ]);
    }

    public function andamentos(Processos $processo): JsonResponse
    {
        $andamentos = $processo->andamentos()
            ->orderByDesc('data_andamento')
            ->get([
                'id',
                'descricao',
                'tipo_andamento',
                'tipo_movimentacao',
                'data_andamento',
                'data_prazo',
                'status',
            ]);

        return response()->json($andamentos);
    }

    public function partes(Processos $processo): JsonResponse
    {
        $partes = $processo->partes()
            ->orderBy('nome')
            ->get()
            ->map(function ($parte) {
                return [
                    'id' => $parte->id,
                    'nome' => $parte->nome,
                    'tipo' => $parte->pivot->tipo_qualificacao,
                    'documento' => $parte->cpf_cnpj,
                    'principal' => (bool) $parte->pivot->parte_principal,
                ];
            });

        return response()->json($partes);
    }

    public function incidencias(Processos $processo): JsonResponse
    {
        $incidencias = $processo->ramificacoes()
            ->orderByDesc('created_at')
            ->get([
                'cnj',
                'status',
                'created_at',
            ]);

        return response()->json($incidencias);
    }
}
