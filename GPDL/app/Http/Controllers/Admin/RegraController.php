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
        $query = DB::table('cargo_permissoes as cp')
            ->leftJoin('cargos as c', 'cp.cargo_id', '=', 'c.id')
            ->leftJoin('permissoes as p', 'cp.permissao_id', '=', 'p.id')
            ->leftJoin('scopes as s', 'cp.scope_id', '=', 's.id')
            ->leftJoin('setores as st', 'cp.setor_id', '=', 'st.id')
            ->select(
                'cp.id',
                'cp.cargo_id',
                'cp.permissao_id',
                'cp.scope_id',
                'cp.setor_id',
                'c.nome as cargo_nome',
                'p.nome as permissao_nome',
                'p.descricao as permissao_descricao',
                's.nome as scope_nome',
                'st.nome as setor_nome',
                'st.sigla as setor_sigla'
            );

        // 📋 Filtros
        if ($request->cargo_id) {
            $query->where('cp.cargo_id', $request->cargo_id);
        }
        if ($request->permissao_id) {
            $query->where('cp.permissao_id', $request->permissao_id);
        }
        if ($request->scope_id) {
            $query->where('cp.scope_id', $request->scope_id);
        }
        if ($request->setor_id) {
            $query->where('cp.setor_id', $request->setor_id);
        }

        $regras = $query->orderBy('c.nome')->orderBy('p.nome')->get();

        // 🔄 Formata para Inertia
        $regrasFormatadas = $regras->map(function ($r) {
            return [
                'id'            => $r->id,
                'cargo_id'      => $r->cargo_id,
                'permissao_id'  => $r->permissao_id,
                'scope_id'      => $r->scope_id,
                'setor_id'      => $r->setor_id,
                'cargo' => [
                    'id'   => $r->cargo_id,
                    'nome' => $r->cargo_nome,
                ],
                'permissao' => [
                    'id'         => $r->permissao_id,
                    'nome'       => $r->permissao_nome,
                    'descricao'  => $r->permissao_descricao,
                ],
                'scope' => $r->scope_id ? [
                    'id'   => $r->scope_id,
                    'nome' => $r->scope_nome,
                ] : null,
                'setor' => $r->setor_id ? [
                    'id'    => $r->setor_id,
                    'nome'  => $r->setor_nome,
                    'sigla' => $r->setor_sigla,
                ] : null,
            ];
        });

        return Inertia::render('Admin/Regras', [
            'regras'      => $regrasFormatadas,
            'cargos'      => Cargo::orderBy('nome')->get(),
            'permissoes'  => Permissao::orderBy('nome')->get(),
            'scopes'      => Scope::orderBy('nome')->get(),
            'setores'     => Setor::where('status', 1)->orderBy('nome')->get(),
            'filters'     => $request->only(['cargo_id']),
        ]);
    }

    /**
     * ➕ Criar nova regra
     */
    public function criarRegra(RegraRequest $request)
{
    DB::table('cargo_permissoes')->insert([
        'cargo_id'     => (int) $request->cargo_id,
        'permissao_id' => (int) $request->permissao_id,
        'scope_id'     => (int) $request->scope_id,
        'setor_id'     => $request->setor_id ? (int) $request->setor_id : null,
        'created_at'   => now(),
        'updated_at'   => now(),
    ]);

    return back(303)->with('success', 'Regra criada com sucesso!');
}

    /**
     * ✏️ Atualizar regra
     */
    public function atualizarRegra(RegraRequest $request)
    {
        DB::table('cargo_permissoes')
            ->where('id', $request->id)
            ->update([
                'cargo_id'     => (int) $request->cargo_id,
                'permissao_id' => (int) $request->permissao_id,
                'scope_id'     => (int) $request->scope_id,
                'setor_id'     => $request->setor_id ? (int) $request->setor_id : null,
                'updated_at'   => now(),
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

        DB::table('cargo_permissoes')->where('id', $id)->delete();

        return back()->with('success', 'Regra excluída com sucesso!');
    }
}
