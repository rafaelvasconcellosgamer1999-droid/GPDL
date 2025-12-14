<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\AndamentoRequest;
use App\Models\Andamento;
use App\Models\Processos;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AndamentoController extends Controller
{
    private int $cargo_procurador = 3;
    private int $cargo_assessor = 4;

    /**
     * Lista de andamentos
     */
    public function index(Request $request)
    {
        $query = Andamento::with([
            'processo:id,cnj',
            'procuradorAndamento:id,nome',
            'assessorAndamento:id,nome',
            'cadastradoPor:id,nome',
        ])->orderByDesc('data_andamento');

        if ($request->filled('processo_id')) {
            $query->where('processo_id', $request->processo_id);
        }

        return Inertia::render('Andamentos/Index', [
            'andamentos' => $query->paginate(15),
        ]);
    }

    /**
     * Tela de cadastro
     */
    public function create()
    {
        return Inertia::render('Andamentos/Cadastro', [
            'procuradores' => User::where('cargo_id', $this->cargo_procurador)
                ->get(['id', 'nome']) // Otimização: Select direto
                ->map(fn ($u) => ['id' => (string) $u->id, 'nome' => $u->nome]),

            'assessores' => User::where('cargo_id', $this->cargo_assessor)
                ->get(['id', 'nome'])
                ->map(fn ($u) => ['id' => (string) $u->id, 'nome' => $u->nome]),
        ]);
    }

    /**
     * Persistência do andamento
     */
    public function store(AndamentoRequest $request)
    {
        // Pega os dados validados
        $data = $request->validated();

        // Adiciona dados automáticos que não vieram do form
        $data['usuario_cadastro_id'] = Auth::id();
        
        // Se data_andamento não vier (embora o Request possa forçar), usa now
        if (empty($data['data_andamento'])) {
            $data['data_andamento'] = now();
        }

        Andamento::create($data);

        return redirect()
            ->route('andamentos.cadastro') // Ou 'andamentos.index'
            ->with('success', 'Andamento cadastrado com sucesso');
    }

    /**
     * Visualização detalhada
     */
    public function show(Andamento $andamento)
    {
        $andamento->load([
            'processo:id,numero_processo',
            'procuradorAndamento:id,name',
            'assessorAndamento:id,name',
            'cadastradoPor:id,name',
        ]);

        return Inertia::render('Andamentos/Show', [
            'andamento' => $andamento,
        ]);
    }

    /**
     * Tela de edição
     */
    public function edit(Andamento $andamento)
    {
        return Inertia::render('Andamentos/Edit', [
            'andamento' => $andamento,
            'processos' => Processos::select('id', 'numero_processo as nome')->get(),
            'procuradores' => User::where('cargo_id', $this->cargo_procurador)->select('id', 'name as nome')->get(),
            'assessores' => User::where('cargo_id', $this->cargo_assessor)->select('id', 'name as nome')->get(),
        ]);
    }

    /**
     * Atualização
     */
    public function update(AndamentoRequest $request, Andamento $andamento)
    {

        $andamento->update($request->validated());

        return redirect()
            ->route('andamentos.show', $andamento)
            ->with('success', 'Andamento atualizado com sucesso');
    }

    /**
     * Exclusão
     */
    public function destroy(Andamento $andamento)
    {
        $andamento->delete();

        return redirect()
            ->route('andamentos.index')
            ->with('success', 'Andamento removido');
    }
}