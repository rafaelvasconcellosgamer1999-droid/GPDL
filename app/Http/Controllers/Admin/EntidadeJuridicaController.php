<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EntidadesRequest;
use App\Models\EntidadesJuridicas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EntidadeJuridicaController extends Controller
{
    // Exibe a lista de entidades jurídicas
    public function index()
    {
        // ordena por nome (ou sigla se preferir)
        $entidades = EntidadesJuridicas::orderBy('nome')->get();

        return Inertia::render('Admin/EntidadesJuridicas', [
            'entidades' => $entidades,
        ]);
    }

    // Cria nova entidade — status padrão = 1 (ativo)
    public function criarEntidade(EntidadesRequest $request)
    {
        $data = $request->validated();

        // garanta status padrão = 1 caso não seja passado
        if (! array_key_exists('status', $data) || $data['status'] === null) {
            $data['status'] = 1;
        }

        // Se nome estiver vazio, preencha com sigla (sua UI faz isso, mas é seguro reforçar no backend)
        if (empty($data['nome']) && ! empty($data['sigla'])) {
            $data['nome'] = $data['sigla'];
        }

        EntidadesJuridicas::create($data);

        return back()->with('success', 'Entidade jurídica criada com sucesso!');
    }

    // Atualiza entidade
    public function editarEntidade(EntidadesRequest $request)
    {
        $entidade = EntidadesJuridicas::findOrFail($request->id);
        $data = $request->validated();

        // manter comportamento consistente: se nome vazio, preencher com sigla
        if (empty($data['nome']) && ! empty($data['sigla'])) {
            $data['nome'] = $data['sigla'];
        }

        $entidade->update($data);

        return back()->with('success', 'Entidade jurídica atualizada com sucesso!');
    }

    // Remove entidade
    public function deletarEntidade(Request $request)
    {
        $entidade = EntidadesJuridicas::findOrFail($request->id);
        $entidade->delete();

        return back()->with('success', 'Entidade jurídica excluída com sucesso!');
    }

    // Alterna status entre ativo/inativo (toggle)
    public function toggleEntidade(Request $request)
    {
        $entidade = EntidadesJuridicas::findOrFail($request->id);

        // suporta status boolean ou 0/1
        $current = $entidade->status;
        $entidade->status = ($current == 1 || $current === true) ? 0 : 1;
        $entidade->save();

        return back()->with('success', 'Status da entidade alterado!');
    }
}
