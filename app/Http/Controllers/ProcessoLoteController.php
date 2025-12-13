<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use App\Services\ProcessoParser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

class ProcessoLoteController extends Controller
{
    protected ProcessoParser $parser;

    public function __construct(ProcessoParser $parser)
    {
        $this->parser = $parser;
    }

    /**
     * Exibe o formulário de cadastro em lote.
     */
    public function create(): Response
    {
        $procuradores = \App\Models\User::ativos()->orderBy('nome')->get(['id', 'nome']);
        return Inertia::render('Processos/CadastroLote', ['procuradores' => $procuradores]);
    }

    /**
     * Processa a importação em lote.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'responsavel_id' => ['required', 'integer', 'exists:usuarios,id'],
            'assunto' => ['nullable', 'string', 'max:180'],
            'texto' => ['required', 'string'],
            'modelo' => ['nullable', 'string', 'in:pje'],
        ]);

        $usuario = Auth::user();
        $responsavel = \App\Models\User::find($data['responsavel_id']);
        $setorId = optional($responsavel)->setor_id;

        $blocos = $this->parser->separarBlocos($data['texto']);

        $inseridos = 0;
        DB::transaction(function () use ($blocos, $data, $usuario, $setorId, &$inseridos) {
            foreach ($blocos as $bloco) {
                $modeloSel = strtolower($data['modelo'] ?? 'pje');
                switch ($modeloSel) {
                    case 'pje':
                    default:
                        $parsed = $this->parser->parsePublicacaoLote($bloco);
                        break;
                }

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

        return redirect()->route('processos.create-lote')
            ->with('success', $inseridos . ' processo(s) importado(s) com sucesso.');
    }
}
