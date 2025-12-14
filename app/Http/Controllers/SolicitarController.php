<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\SolicitacaoRequest;
use App\Models\Solicitacao;

class SolicitarController extends Controller
{
    /**
     * Recebe solicitações de acesso a partir da tela de login.
     */
    public function store(SolicitacaoRequest $request)
    {
        Solicitacao::create($request->validated());

        return back()->with('status', 'Solicitação enviada! O time de suporte analisará e retornará em breve.');
    }
}