<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SolicitacaoRequest; // Importação correta
use App\Models\Solicitacao;
use App\Models\User;
use App\Models\Cargo;
use App\Models\Setor;
use App\Services\SendEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SolicitacaoController extends Controller
{
    public function index()
    {
        $solicitacoes = Solicitacao::with('cargo')->get();
        $cargos = Cargo::all();
        $setores = Setor::ativos()->get();

        return Inertia::render('Admin/Solicitacoes', [
            'solicitacoes' => $solicitacoes,
            'cargos' => $cargos,
            'setores' => $setores
        ]);
    }

    public function aprovarSolicitacao(SolicitacaoRequest $request) // Usando o SolicitaçãoRequest
    {
        $solicitacao = Solicitacao::findOrFail($request->id);

        User::create([
            'nome' => $solicitacao->nome,
            'email' => $solicitacao->email,
            'usuarioRede' => $solicitacao->usuarioRede,
            'senha' => Hash::make($request->senha),
            'cargo_id' => $request->cargo_id,
            'setor_id' => $request->setor_id,
            'precisa_trocar_senha' => true,
            'status' => 1
        ]);
        new SendEmail($solicitacao->email,
         $request->senha,
         $solicitacao->nome,
         $solicitacao->usuarioRede
        );
        $solicitacao->delete();

        return back()->with('success', 'Solicitação aprovada e usuário criado!');
    }

    public function rejeitarSolicitacao(Request $request)
{
    Solicitacao::destroy($request->id);

    // impede o 303 e evita GET subsequente
    if ($request->expectsJson()) {
        return response()->json([
            'success' => true,
            'message' => 'Solicitação rejeitada com sucesso.'
        ]);
    }

    // só redireciona se NÃO for uma chamada AJAX/Inertia
    return back()->with('success', 'Solicitação rejeitada com sucesso.');
}
}

