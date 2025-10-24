<?php

namespace App\Http\Controllers;

use App\Models\{Setor, Cargo, Permissao, Scope, User, Solicitacao};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // Dashboard Admin
    public function index()
    {
        $stats = [
            'usuarios' => User::count(),
            'setores' => Setor::count(),
            'cargos' => Cargo::count(),
            'solicitacoes_pendentes' => Solicitacao::count(),
        ];

        return Inertia::render('Admin/Index', [
            'stats' => $stats
        ]);
    }

    // ========== SETORES ==========

    public function setores()
    {
        $setores = Setor::all();
        return Inertia::render('Admin/Setores', [
            'setores' => $setores
        ]);
    }

    public function criarSetor(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:100',
            'sigla' => 'nullable|string|max:20',
        ]);

        Setor::create($request->all());

        return back()->with('success', 'Setor criado com sucesso!');
    }

    public function editarSetor(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:setores,id',
            'nome' => 'required|string|max:100',
            'sigla' => 'nullable|string|max:20',
        ]);

        $setor = Setor::findOrFail($request->id);
        $setor->update($request->only(['nome', 'sigla']));

        return back()->with('success', 'Setor atualizado com sucesso!');
    }

    public function toggleSetor(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:setores,id'
        ]);

        $setor = Setor::findOrFail($request->id);
        $setor->ativo = !$setor->ativo;
        $setor->save();

        return back()->with('success', 'Status do setor alterado!');
    }

    // ========== CARGOS ==========

    public function cargos()
    {
        $cargos = Cargo::withCount('usuarios')->get();
        return Inertia::render('Admin/Cargos', [
            'cargos' => $cargos
        ]);
    }

    public function criarCargo(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:50|unique:cargos,nome',
        ]);

        Cargo::create($request->all());

        return back()->with('success', 'Cargo criado com sucesso!');
    }

    public function editarCargo(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:cargos,id',
            'nome' => 'required|string|max:50',
        ]);

        $cargo = Cargo::findOrFail($request->id);
        $cargo->update($request->only('nome'));

        return back()->with('success', 'Cargo atualizado com sucesso!');
    }

    public function excluirCargo(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:cargos,id'
        ]);

        $cargo = Cargo::findOrFail($request->id);

        if ($cargo->usuarios()->count() > 0) {
            return back()->with('error', 'Não é possível excluir um cargo com usuários vinculados.');
        }

        $cargo->delete();

        return back()->with('success', 'Cargo excluído com sucesso!');
    }

    // ========== USUÁRIOS ==========

    public function usuarios(Request $request)
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

    public function atualizarUsuario(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:usuarios,id',
            'cargo_id' => 'required|exists:cargos,id',
            'setor_id' => 'nullable|exists:setores,id',
        ]);

        $user = User::findOrFail($request->id);
        $user->update($request->only(['cargo_id', 'setor_id']));

        return back()->with('success', 'Usuário atualizado com sucesso!');
    }

    public function resetarSenhaUsuario(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:usuarios,id'
        ]);

        $user = User::findOrFail($request->id);
        $senhaTemporaria = 'Temp' . rand(1000, 9999);

        $user->update([
            'senha' => Hash::make($senhaTemporaria),
            'precisa_trocar_senha' => true
        ]);

        return back()->with('success', "Senha resetada! Senha temporária: {$senhaTemporaria}");
    }

    public function desabilitarUsuario(Request $request)
    {
        $request->validate(['id' => 'required|exists:usuarios,id']);

        $user = User::findOrFail($request->id);
        $user->update(['status' => 0]);

        return back()->with('success', 'Usuário desabilitado!');
    }

    public function habilitarUsuario(Request $request)
    {
        $request->validate(['id' => 'required|exists:usuarios,id']);

        $user = User::findOrFail($request->id);
        $senhaTemporaria = 'Temp' . rand(1000, 9999);

        $user->update([
            'status' => 1,
            'senha' => Hash::make($senhaTemporaria),
            'precisa_trocar_senha' => true
        ]);

        return back()->with('success', "Usuário habilitado! Senha temporária: {$senhaTemporaria}");
    }

    // ========== SOLICITAÇÕES ==========

    public function solicitacoes()
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

    public function aprovarSolicitacao(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:solicitacoes,id',
            'cargo_id' => 'required|exists:cargos,id',
            'setor_id' => 'required|exists:setores,id',
            'senha' => 'required|string|min:6'
        ]);

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

        $solicitacao->delete();

        return back()->with('success', 'Solicitação aprovada e usuário criado!');
    }

    public function rejeitarSolicitacao(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:solicitacoes,id'
        ]);

        Solicitacao::destroy($request->id);

        return back()->with('success', 'Solicitação rejeitada!');
    }

    // ========== PERMISSÕES ==========

    public function permissoes()
    {
        $permissoes = Permissao::orderBy('nome')->get();

        return Inertia::render('Admin/Permissoes', [
            'permissoes' => $permissoes
        ]);
    }

    public function criarPermissao(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:60|unique:permissoes,nome',
            'descricao' => 'nullable|string|max:120',
        ]);

        Permissao::create($request->only(['nome', 'descricao']));

        return back()->with('success', 'Permissão criada com sucesso!');
    }

    public function editarPermissao(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:permissoes,id',
            'nome' => 'required|string|max:60',
            'descricao' => 'nullable|string|max:120',
        ]);

        $permissao = Permissao::findOrFail($request->id);
        $permissao->update($request->only(['nome', 'descricao']));

        return back()->with('success', 'Permissão atualizada com sucesso!');
    }

    public function excluirPermissao(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:permissoes,id'
        ]);

        $permissao = Permissao::findOrFail($request->id);

        // Verificar se há regras vinculadas (opcional)
        // if ($permissao->cargos()->count() > 0) {
        //     return back()->with('error', 'Não é possível excluir uma permissão com regras vinculadas.');
        // }

        $permissao->delete();

        return back()->with('success', 'Permissão excluída com sucesso!');
    }

    // ========== REGRAS ==========

    public function regras(Request $request)
    {
        $query = DB::table('cargo_permissoes_scoped as cps')
            ->leftJoin('cargos as c', 'cps.cargo_id', '=', 'c.id')
            ->leftJoin('permissoes as p', 'cps.permissao_id', '=', 'p.id')
            ->leftJoin('scopes as s', 'cps.scope_id', '=', 's.id')
            ->leftJoin('setores as st', 'cps.setor_id', '=', 'st.id')
            ->select(
                'cps.id',
                'cps.cargo_id',
                'cps.permissao_id',
                'cps.scope_id',
                'cps.setor_id',
                'c.nome as cargo_nome',
                'p.nome as permissao_nome',
                'p.descricao as permissao_descricao',
                's.nome as scope_nome',
                'st.nome as setor_nome',
                'st.sigla as setor_sigla'
            );

        if ($request->cargo_id) {
            $query->where('cps.cargo_id', $request->cargo_id);
        }

        $regras = $query->orderBy('c.nome')->orderBy('p.nome')->get();

        // Formatar para o frontend
        $regrasFormatadas = $regras->map(function ($regra) {
            return [
                'id' => $regra->id,
                'cargo_id' => $regra->cargo_id,
                'permissao_id' => $regra->permissao_id,
                'scope_id' => $regra->scope_id,
                'setor_id' => $regra->setor_id,
                'cargo' => ['nome' => $regra->cargo_nome],
                'permissao' => [
                    'nome' => $regra->permissao_nome,
                    'descricao' => $regra->permissao_descricao
                ],
                'scope' => ['nome' => $regra->scope_nome],
                'setor' => $regra->setor_nome ? [
                    'nome' => $regra->setor_nome,
                    'sigla' => $regra->setor_sigla
                ] : null,
            ];
        });

        $cargos = Cargo::all();
        $permissoes = Permissao::all();
        $scopes = Scope::all();
        $setores = Setor::where('ativo', 1)->get();

        return Inertia::render('Admin/Regras', [
            'regras' => $regrasFormatadas,
            'cargos' => $cargos,
            'permissoes' => $permissoes,
            'scopes' => $scopes,
            'setores' => $setores,
            'filters' => $request->only(['cargo_id'])
        ]);
    }
    public function criarRegra(Request $request)
    {
        $request->validate([
            'cargo_id' => 'required|exists:cargos,id',
            'permissao_id' => 'required|exists:permissoes,id',
            'scope_id' => 'nullable|exists:scopes,id',
            'setor_id' => 'nullable|exists:setores,id',
        ]);
        DB::table('cargo_permissoes_scoped')->insert([
            'cargo_id' => $request->cargo_id,
            'permissao_id' => $request->permissao_id,
            'scope_id' => $request->scope_id ?: null,
            'setor_id' => $request->setor_id ?: null,
            'criado_em' => now(),
        ]);

        return back()->with('success', 'Regra criada com sucesso!');
    }
    public function atualizarRegra(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:cargo_permissoes_scoped,id',
            'cargo_id' => 'required|exists:cargos,id',
            'permissao_id' => 'required|exists:permissoes,id',
            'scope_id' => 'nullable|exists:scopes,id',
            'setor_id' => 'nullable|exists:setores,id',
        ]);
        DB::table('cargo_permissoes_scoped')
            ->where('id', $request->id)
            ->update([
                'cargo_id' => $request->cargo_id,
                'permissao_id' => $request->permissao_id,
                'scope_id' => $request->scope_id ?: null,
                'setor_id' => $request->setor_id ?: null,
            ]);

        return back()->with('success', 'Regra atualizada com sucesso!');
    }
    public function excluirRegra(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:cargo_permissoes_scoped,id'
        ]);
        DB::table('cargo_permissoes_scoped')->where('id', $request->id)->delete();

        return back()->with('success', 'Regra excluída com sucesso!');
    }
}
