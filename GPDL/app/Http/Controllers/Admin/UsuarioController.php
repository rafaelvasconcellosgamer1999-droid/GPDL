<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UsuarioRequest;
use App\Models\User;
use App\Models\Cargo;
use App\Models\Setor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    /**
     * Lista de usuários com filtros
     */
    public function index(Request $request)
    {
        $usuarios = User::with(['cargo', 'setor'])
            ->when($request->cargo_id, fn($q) => $q->where('cargo_id', $request->cargo_id))
            ->when($request->setor_id, fn($q) => $q->where('setor_id', $request->setor_id))
            ->when($request->status, function ($q) use ($request) {
                if ($request->status === 'ativos') {
                    $q->where('status', 1);
                } elseif ($request->status === 'inativos') {
                    $q->where('status', 0);
                }
            })
            ->orderBy('nome')
            ->paginate(20)
            ->withQueryString(); // Mantém os parâmetros na paginação

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
    public function atualizar(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:usuarios,id',
            'cargo_id' => 'required|exists:cargos,id',
            'setor_id' => 'nullable|exists:setores,id',
        ]);

        $user = User::findOrFail($validated['id']);
        
        $user->update([
            'cargo_id' => $validated['cargo_id'],
            'setor_id' => $validated['setor_id'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Usuário atualizado com sucesso!');
    }

    /**
     * Resetar senha do usuário
     */
    public function resetarSenha(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:usuarios,id',
        ]);

        $user = User::findOrFail($validated['id']);
        
        // Gera senha temporária mais segura
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
    public function desabilitar(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:usuarios,id',
        ]);

        $user = User::findOrFail($validated['id']);
        
        // Não pode desabilitar a si mesmo
        if ($user->id === auth()->id()) {
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
    public function habilitar(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:usuarios,id',
        ]);

        $user = User::findOrFail($validated['id']);
        
        // Gera nova senha temporária ao habilitar
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
    public function excluir(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:usuarios,id',
        ]);

        $user = User::findOrFail($validated['id']);
        
        // Não pode excluir a si mesmo
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors([
                'error' => 'Você não pode excluir sua própria conta!'
            ]);
        }

        // Verifica se o usuário tem relacionamentos críticos
        // Você pode adicionar outras verificações conforme necessário
        // Por exemplo: processos, auditorias, etc.
        
        $nomeUsuario = $user->nome;
        $user->delete();

        return redirect()->back()->with('success', "Usuário \"{$nomeUsuario}\" excluído permanentemente!");
    }
}