<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SetorRequest;
use App\Models\Setor;
use Inertia\Inertia;

class SetorController extends Controller
{
    // ✅ Apenas exibe a lista de setores
    public function index()
    {
        $setores = Setor::withCount('usuarios')->get();

        return Inertia::render('Admin/Setores', [
            'setores' => $setores
        ]);
    }

    // ✅ Cria novo setor (usa SetorRequest)
    public function criarSetor(SetorRequest $request)
    {
        Setor::create($request->validated());

        return back()->with('success', 'Setor criado com sucesso!');
    }

    // ✅ Atualiza setor existente (usa SetorRequest)
    public function editarSetor(SetorRequest $request)
    {
        $setor = Setor::findOrFail($request->id);
        $setor->update($request->validated());

        return back()->with('success', 'Setor atualizado com sucesso!');
    }

    // ✅ Ativa/desativa setor (usa SetorRequest)
    public function toggleSetor(SetorRequest $request)
    {
        $setor = Setor::findOrFail($request->id);
        $setor->status = !$setor->status;
        $setor->save();

        return back()->with('success', 'Status do setor alterado!');
    }
}
