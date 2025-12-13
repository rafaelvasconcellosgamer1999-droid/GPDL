<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProcessoIndividualController extends Controller
{
    /**
     * Exibe o formulário de cadastro individual.
     */
    public function create(): Response
    {
        $procuradores = \App\Models\User::ativos()->orderBy('nome')->get(['id', 'nome']);
        return Inertia::render('Processos/CadastroIndividual', ['procuradores' => $procuradores]);
    }

    /**
     * Armazena um novo processo individualmente.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'numero' => ['required', 'string', 'max:50'], // Adjust max length as needed
            'orgao' => ['nullable', 'string', 'max:255'],
            'acao' => ['nullable', 'string', 'max:255'],
            'assunto' => ['nullable', 'string', 'max:255'],
            'partes_envolvidas' => ['nullable', 'string'],
            'vara_juizo' => ['nullable', 'string', 'max:255'],
            'procurador_responsavel_id' => ['required', 'integer', 'exists:usuarios,id'],
            'data_ciencia' => ['nullable', 'date'],
            'data_limite' => ['nullable', 'date'],
            'ultimo_mov_texto' => ['nullable', 'string'],
            'ultimo_mov_data' => ['nullable', 'date'],
        ]);

        $usuario = Auth::user();
        $responsavel = \App\Models\User::find($data['procurador_responsavel_id']);
        $setorId = optional($responsavel)->setor_id;

        Processo::create([
            'numero' => $data['numero'],
            'orgao' => $data['orgao'] ?? null,
            'acao' => $data['acao'] ?? null,
            'assunto' => $data['assunto'] ?? null,
            'partes_envolvidas' => $data['partes_envolvidas'] ?? null,
            'vara_juizo' => $data['vara_juizo'] ?? null,
            'procurador_responsavel_id' => $data['procurador_responsavel_id'],
            'usuario_cadastro_id' => optional($usuario)->id,
            'data_ciencia' => $data['data_ciencia'] ?? null,
            'data_limite' => $data['data_limite'] ?? null,
            'ultimo_mov_texto' => $data['ultimo_mov_texto'] ?? null,
            'ultimo_mov_data' => $data['ultimo_mov_data'] ?? null,
            'origem_cadastro' => 'manual',
            'setor_id' => $setorId,
            'data_entrada' => now(),
        ]);

        return redirect()->route('processos.create')->with('success', 'Processo cadastrado com sucesso.');
    }
}
