<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegraRequest;
use App\Models\{Cargo, Permissao, Scope, Setor};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RegraController extends Controller
{
    /**
     * 🧩 Lista de regras de permissão
     */
    public function index(Request $request)
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

        // 📋 Filtro por cargo
        if ($request->cargo_id) {
            $query->where('cps.cargo_id', $request->cargo_id);
        }

        if ($request->permissao_id) {
            $query->where('cps.permissao_id', $request->permissao_id);
        }
        if ($request->scope_id) {
            $query->where('cps.scope_id', $request->scope_id);
        }
        if ($request->setor_id) {
            $query->where('cps.setor_id', $request->setor_id);
        }

        $regras = $query->orderBy('c.nome')->orderBy('p.nome')->get();

        // 🔄 Formata os dados conforme a tipagem da view
        $regrasFormatadas = $regras->map(function ($regra) {
            return [
                'id' => $regra->id,
                'cargo_id' => $regra->cargo_id,
                'permissao_id' => $regra->permissao_id,
                'scope_id' => $regra->scope_id,
                'setor_id' => $regra->setor_id,
                'cargo' => [
                    'id' => $regra->cargo_id,
                    'nome' => $regra->cargo_nome,
                ],
                'permissao' => [
                    'id' => $regra->permissao_id,
                    'nome' => $regra->permissao_nome,
                    'descricao' => $regra->permissao_descricao,
                ],
                'scope' => [
                    'id' => $regra->scope_id,
                    'nome' => $regra->scope_nome,
                ],
                'setor' => $regra->setor_nome ? [
                    'id' => $regra->setor_id,
                    'nome' => $regra->setor_nome,
                    'sigla' => $regra->setor_sigla,
                ] : null,
            ];
        });

        return Inertia::render('Admin/Regras', [
            'regras' => $regrasFormatadas,
            'cargos' => Cargo::orderBy('nome')->get(),
            'permissoes' => Permissao::orderBy('nome')->get(),
            'scopes' => Scope::orderBy('nome')->get(),
            'setores' => Setor::where('status', 1)->orderBy('nome')->get(),
            'filters' => $request->only(['cargo_id']),
        ]);
    }

    /**
     * ➕ Criar nova regra
     */
    public function criarRegra(RegraRequest $request)
    {
        DB::table('cargo_permissoes_scoped')->insert([
            'cargo_id' => (int) $request->cargo_id,
            'permissao_id' => (int) $request->permissao_id,
            'scope_id' => $request->scope_id ? (int) $request->scope_id : null,
            'setor_id' => $request->setor_id ? (int) $request->setor_id : null,
            'criado_em' => now(),
        ]);

        return back()->with('success', 'Regra criada com sucesso!');
    }

    /**
     * ✏️ Atualizar regra existente
     */
    public function atualizarRegra(RegraRequest $request)
    {
        DB::table('cargo_permissoes_scoped')
            ->where('id', $request->id)
            ->update([
                'cargo_id' => (int) $request->cargo_id,
                'permissao_id' => (int) $request->permissao_id,
                'scope_id' => $request->scope_id ? (int) $request->scope_id : null,
                'setor_id' => $request->setor_id ? (int) $request->setor_id : null,
            ]);

        return back()->with('success', 'Regra atualizada com sucesso!');
    }

    /**
     * ❌ Excluir regra
     */
    public function excluirRegra(Request $request)
    {
        $id = $request->id ?? null;

        if (!$id) {
            return back()->with('error', 'ID da regra não informado.');
        }

        DB::table('cargo_permissoes_scoped')->where('id', $id)->delete();

        return back()->with('success', 'Regra excluída com sucesso!');
    }
}
