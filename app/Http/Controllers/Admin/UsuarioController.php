<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UsuarioRequest; // Importando o request
use App\Models\User;
use App\Models\Cargo;
use App\Models\Setor;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function index(UsuarioRequest $request) // Aqui o request já valida os parâmetros
    {
        $usuarios = User::with(['cargo', 'setor'])
            ->when($request->cargo_id, fn($q) => $q->where('cargo_id', $request->cargo_id))
            ->when($request->setor_id, fn($q) => $q->where('setor_id', $request->setor_id))
            ->when($request->status, function ($q) use ($request) {
                if ($request->status === 'ativos') $q->where('status', 1);
                elseif ($request->status === 'inativos') $q->where('status', 0);
            })
            ->paginate(20);

        $cargos = Cargo::all();
        $setores = Setor::ativos()->get();

        return Inertia::render('Admin/Usuarios', [
            'usuarios' => $usuarios,
            'cargos' => $cargos,
            'setores' => $setores,
            'filters' => $request->only(['cargo_id', 'setor_id', 'status'])
        ]);
    }

    // Atualizar usuário agora com a validação no UsuarioRequest
    public function atualizarUsuario(UsuarioRequest $request)
    {
        // Não há mais necessidade de validação aqui
        $user = User::findOrFail($request->id);
        $user->update($request->only(['cargo_id', 'setor_id']));

        return back()->with('success', 'Usuário atualizado com sucesso!');
    }

    // Resetar senha do usuário agora com a validação no UsuarioRequest
    public function resetarSenhaUsuario(UsuarioRequest $request)
    {
        // O UsuarioRequest já garante que o 'id' seja válido
        $user = User::findOrFail($request->id);
        $senhaTemporaria = 'Temp' . rand(1000, 9999);

        $user->update([
            'senha' => Hash::make($senhaTemporaria),
            'precisa_trocar_senha' => true
        ]);

        return back()->with('success', "Senha resetada! Senha temporária: {$senhaTemporaria}");
    }

    // Desabilitar usuário agora com a validação no UsuarioRequest
    public function desabilitarUsuario(UsuarioRequest $request)
    {
        // O UsuarioRequest já garante que o 'id' seja válido
        $user = User::findOrFail($request->id);
        $user->update(['status' => 0]);

        return back()->with('success', 'Usuário desabilitado!');
    }

    // Habilitar usuário agora com a validação no UsuarioRequest
    public function habilitarUsuario(UsuarioRequest $request)
    {
        // O UsuarioRequest já garante que o 'id' seja válido
        $user = User::findOrFail($request->id);
        $senhaTemporaria = 'Temp' . rand(1000, 9999);

        $user->update([
            'status' => 1,
            'senha' => Hash::make($senhaTemporaria),
            'precisa_trocar_senha' => true
        ]);

        return back()->with('success', "Usuário habilitado! Senha temporária: {$senhaTemporaria}");
    }
}

