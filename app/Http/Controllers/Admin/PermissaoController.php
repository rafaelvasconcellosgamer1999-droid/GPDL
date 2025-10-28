<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissaoRequest;
use App\Models\Permissao;
use Inertia\Inertia;

class PermissaoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Permissoes', [
            'permissoes' => Permissao::orderBy('nome')->get(),
        ]);
    }

    public function criarPermissao(PermissaoRequest $request)
    {
        Permissao::create($request->validated());
        return back()->with('success', 'Permissão criada com sucesso!');
    }

    public function editarPermissao(PermissaoRequest $request)
    {
        $permissao = Permissao::findOrFail($request->id);
        $permissao->update($request->validated());

        return back()->with('success', 'Permissão atualizada com sucesso!');
    }

    public function excluirPermissao(Permissao $permissao)
{
    $permissao->delete();
    return back()->with('success', 'Permissão excluída com sucesso!');
}
}
