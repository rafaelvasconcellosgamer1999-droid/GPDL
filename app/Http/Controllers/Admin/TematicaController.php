<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TematicaRequest; 
use App\Models\Tematicas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TematicaController extends Controller
{
    // Exibe a lista de temáticas
    public function index()
    {
        $tematicas = Tematicas::orderBy('nome')->get();

        return Inertia::render('Admin/Tematicas', [
            'tematicas' => $tematicas,
        ]);
    }

    // Cria nova temática
    public function criarTematica(TematicaRequest $request)
    {
        Tematicas::create($request->validated());

        return back()->with('success', 'Temática criada com sucesso!');
    }

    // Atualiza temática existente
    public function editarTematica(TematicaRequest $request)
    {
        $tematica = Tematicas::findOrFail($request->id);
        $tematica->update($request->validated());

        return back()->with('success', 'Temática atualizada com sucesso!');
    }

    // Remove temática
    public function deletarTematica(Request $request)
    {
        // aceita payload { id }
        $tematica = Tematicas::findOrFail($request->id);
        $tematica->delete();

        return back()->with('success', 'Temática excluída com sucesso!');
    }
}
