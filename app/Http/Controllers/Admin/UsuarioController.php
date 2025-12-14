<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UsuarioRequest; 
use App\Models\User;
use App\Models\Cargo;
use App\Models\Setor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    /**
     * Lista de usuários com filtros
     * O Laravel valida automaticamente os filtros (GET) definidos no UsuarioRequest
     */
    public function index(UsuarioRequest $request)
    {
        // Pegamos apenas dados validados e seguros
        $filters = $request->validated();

        $usuarios = User::with(['cargo', 'setor'])
            ->when($filters['cargo_id'] ?? null, fn($q, $v) => $q->where('cargo_id', $v))
            ->when($filters['setor_id'] ?? null, fn($q, $v) => $q->where('setor_id', $v))
            ->when($filters['status'] ?? null, function ($q, $status) {
                if ($status === 'ativos') {
                    $q->where('status', 1);
                } elseif ($status === 'inativos') {
                    $q->where('status', 0);
                }
            })
            ->orderBy('nome')
            ->paginate(20)
            ->withQueryString();

        $cargos = Cargo::orderBy('nome')->get();
        $setores = Setor::ativos()->orderBy('nome')->get();

        return Inertia::render('Admin/Usuarios', [
            'usuarios' => $usuarios,
            'cargos' => $cargos,
            'setores' => $setores,
            'filters' => $request->only(['cargo_id', 'setor_id', 'status'])
        ]);
    }

    /**
     * Atualizar usuário (cargo e setor)
     */
    public function atualizar(UsuarioRequest $request)
    {
        // Se chegou aqui, id, cargo_id e setor_id já estão validados
        $data = $request->validated();

        $user = User::findOrFail($data['id']);
        
        $user->update([
            'cargo_id' => $data['cargo_id'],
            'setor_id' => $data['setor_id'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Usuário atualizado com sucesso!');
    }

    /**
     * Resetar senha do usuário
     */
    public function resetarSenha(UsuarioRequest $request)
    {
        // Validação de 'id' feita automaticamente pelo UsuarioRequest
        $user = User::findOrFail($request->validated()['id']);
        
        $senhaTemporaria = 'Temp' . rand(1000, 9999);

        $user->update([
            'senha' => Hash::make($senhaTemporaria),
            'precisa_trocar_senha' => true
        ]);

        return redirect()->back()->with([
            'success' => 'Senha resetada com sucesso!',
            'senha' => $senhaTemporaria
        ]);
    }

    /**
     * Desabilitar usuário
     */
    public function desabilitar(UsuarioRequest $request)
    {
        $user = User::findOrFail($request->validated()['id']);
        
        if ($user->id === Auth::id()) {
            return redirect()->back()->withErrors([
                'error' => 'Você não pode desabilitar sua própria conta!'
            ]);
        }

        $user->update(['status' => 0]);

        return redirect()->back()->with('success', 'Usuário desabilitado com sucesso!');
    }

    /**
     * Habilitar usuário
     */
    public function habilitar(UsuarioRequest $request)
    {
        $user = User::findOrFail($request->validated()['id']);
        
        $senhaTemporaria = 'Temp' . rand(1000, 9999);

        $user->update([
            'status' => 1,
            'senha' => Hash::make($senhaTemporaria),
            'precisa_trocar_senha' => true
        ]);

        return redirect()->back()->with([
            'success' => 'Usuário habilitado com sucesso!',
            'senha' => $senhaTemporaria
        ]);
    }

    /**
     * Excluir usuário permanentemente
     */
    public function excluir(UsuarioRequest $request)
    {
        $user = User::findOrFail($request->validated()['id']);
        
        if ($user->id === Auth::id()) {
            return redirect()->back()->withErrors([
                'error' => 'Você não pode excluir sua própria conta!'
            ]);
        }

        $nomeUsuario = $user->nome;
        $user->delete();

        return redirect()->back()->with('success', "Usuário \"{$nomeUsuario}\" excluído permanentemente!");
    }
}