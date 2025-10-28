<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Solicitacao;

class SolicitarController extends Controller
{
    /**
     * Recebe solicitações de acesso a partir da tela de login.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:100'],
            'usuarioRede' => ['required', 'string', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:150'],
            'setor' => ['nullable', 'string', 'max:120'],
        ]);

        Solicitacao::create([
            'nome' => $validated['nome'],
            'usuarioRede' => $validated['usuarioRede'],
            'email' => $validated['email'],
            'setor' => $validated['setor'] ?? null,
        ]);

        return back()->with('status', 'Solicitação enviada! O time de suporte analisará e retornará em breve.');
    }
}
