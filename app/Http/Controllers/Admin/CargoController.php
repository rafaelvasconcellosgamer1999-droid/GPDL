<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CargoRequest;
use App\Models\Cargo;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CargoController extends Controller
{
    // Listar cargos
    public function index()
    {
        $cargos = Cargo::withCount('usuarios')->get();

        return Inertia::render('Admin/Cargos', [
            'cargos' => $cargos
        ]);
    }

    // Criar cargo
    public function criarCargo(CargoRequest $request)
    {
        // Criação de cargo com o status definido no request
        $cargo = Cargo::create([
            'nome' => $request->nome,
            'status' => $request->status ?? 1, // Define o status como ativo (1) se não for informado
        ]);

        return back()->with('success', 'Cargo criado com sucesso!');
    }

    // Editar cargo
    public function editarCargo(CargoRequest $request)
    {
        $cargo = Cargo::findOrFail($request->id);
        
        // Atualizando os dados do cargo, incluindo o status
        $cargo->update([
            'nome' => $request->nome,
            'status' => $request->status ?? $cargo->status, // Se não for enviado, mantém o status atual
        ]);

        return back()->with('success', 'Cargo atualizado com sucesso!');
    }

    // Excluir cargo
    public function excluirCargo(CargoRequest $request)
    {
        $cargo = Cargo::findOrFail($request->id);

        // Verificando se existem usuários vinculados ao cargo
        if ($cargo->usuarios()->count() > 0) {
            return back()->with('error', 'Não é possível excluir um cargo com usuários vinculados.');
        }

        $cargo->delete();

        return back()->with('success', 'Cargo excluído com sucesso!');
    }

    // Alterar status do cargo (ativo/inativo)
    public function toggleStatus(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:cargos,id',
        ]);

        $cargo = Cargo::findOrFail($request->id);
        $cargo->status = !$cargo->status; // Alterna entre 1 (ativo) e 0 (inativo)
        $cargo->save();

        return back()->with('success', 'Status do cargo alterado!');
    }
}
