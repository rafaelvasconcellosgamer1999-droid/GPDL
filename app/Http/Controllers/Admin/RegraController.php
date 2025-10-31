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
            ->leftJoin('setores as st', 'cp.setor_id', '=', 'st.id')
            ->leftJoin('cargo_setor_scope as css', function ($join) {
                $join->on('css.cargo_id', '=', 'cp.cargo_id')
                     ->on(DB::raw('css.setor_id'), '=', DB::raw('cp.setor_id'));
            })
            ->leftJoin('scopes as s', 'css.scope_id', '=', 's.id')
            ->select(
                'cp.id',
                'cp.cargo_id',
                'cp.permissao_id',
                'cp.setor_id',
                'css.scope_id',
                'c.nome as cargo_nome',
                'p.nome as permissao_nome',
                'p.descricao as permissao_descricao',
                's.nome as scope_nome',
                'st.nome as setor_nome',
                'st.sigla as setor_sigla'
            );

        // 📋 Filtro por cargo
        if ($request->cargo_id) {
            $query->where('cp.cargo_id', $request->cargo_id);
        }

        if ($request->permissao_id) {
            $query->where('cp.permissao_id', $request->permissao_id);
        }
        if ($request->scope_id) {
            $query->where('css.scope_id', $request->scope_id);
        }
        if ($request->setor_id) {
            $query->where('cp.setor_id', $request->setor_id);
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
                'scope' => $regra->scope_nome ? [
                    'id' => $regra->scope_id,
                    'nome' => $regra->scope_nome,
                ] : null,
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
     * ➕ Criar nova regra de permissão
     */
    public function criarRegra(RegraRequest $request)
    {
        // Insere na pivot de permissões (agora sem scope_id)
        DB::table('cargo_permissoes')->insert([
            'cargo_id'     => (int) $request->cargo_id,
            'permissao_id' => (int) $request->permissao_id,
            'setor_id'     => $request->setor_id ? (int) $request->setor_id : null,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // Atualiza ou cria o escopo padrão no cargo_setor_scope
        if ($request->scope_id) {
            $cargoId = (int) $request->cargo_id;
            $setorId = $request->setor_id ? (int) $request->setor_id : null;
            $scopeId = (int) $request->scope_id;

            $existing = DB::table('cargo_setor_scope')
                ->where('cargo_id', $cargoId)
                ->where('setor_id', $setorId)
                ->first();

            if ($existing) {
                DB::table('cargo_setor_scope')
                    ->where('cargo_id', $cargoId)
                    ->where('setor_id', $setorId)
                    ->update([
                        'scope_id'   => $scopeId,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('cargo_setor_scope')->insert([
                    'cargo_id'   => $cargoId,
                    'setor_id'   => $setorId,
                    'scope_id'   => $scopeId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return back()->with('success', 'Regra criada com sucesso!');
    }

    /**
     * ✏️ Atualizar regra existente
     */
    public function atualizarRegra(RegraRequest $request)
    {
        // Atualiza na pivot de permissões
        DB::table('cargo_permissoes')
            ->where('id', $request->id)
            ->update([
                'cargo_id'     => (int) $request->cargo_id,
                'permissao_id' => (int) $request->permissao_id,
                'setor_id'     => $request->setor_id ? (int) $request->setor_id : null,
                'updated_at'   => now(),
            ]);

        // Atualiza (ou cria) o escopo padrão, se informado
        if ($request->scope_id) {
            $cargoId = (int) $request->cargo_id;
            $setorId = $request->setor_id ? (int) $request->setor_id : null;
            $scopeId = (int) $request->scope_id;

            $existing = DB::table('cargo_setor_scope')
                ->where('cargo_id', $cargoId)
                ->where('setor_id', $setorId)
                ->first();

            if ($existing) {
                DB::table('cargo_setor_scope')
                    ->where('cargo_id', $cargoId)
                    ->where('setor_id', $setorId)
                    ->update([
                        'scope_id'   => $scopeId,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('cargo_setor_scope')->insert([
                    'cargo_id'   => $cargoId,
                    'setor_id'   => $setorId,
                    'scope_id'   => $scopeId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

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

        // Recupera a regra para saber cargo/setor antes de excluir
        $regra = DB::table('cargo_permissoes')->where('id', $id)->first();

        // Exclui a regra da pivot de permissões
        DB::table('cargo_permissoes')->where('id', $id)->delete();

        // Se não houver mais permissões desse cargo no setor, remove o escopo
        if ($regra) {
            $remanescentes = DB::table('cargo_permissoes')
                ->where('cargo_id', $regra->cargo_id)
                ->where('setor_id', $regra->setor_id)
                ->exists();

            if (!$remanescentes) {
                DB::table('cargo_setor_scope')
                    ->where('cargo_id', $regra->cargo_id)
                    ->where('setor_id', $regra->setor_id)
                    ->delete();
            }
        }

        return back()->with('success', 'Regra excluída com sucesso!');
    }
}
