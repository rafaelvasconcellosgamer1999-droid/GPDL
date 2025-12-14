<?php

namespace App\Http\Controllers;

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
     * Lista de andamentos (opcionalmente filtrada)
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
     * Tela de cadastro de andamento (genérica ou contextual)
     */
    public function create()
    {
        return Inertia::render('Andamentos/Cadastro', [
    'procuradores' => User::where('cargo_id', $this->cargo_procurador)
        ->get()
        ->map(fn ($u) => [
            'id' => (string) $u->id,
            'nome' => $u->nome,
        ]),

    'assessores' => User::where('cargo_id', $this->cargo_assessor)
        ->get()
        ->map(fn ($u) => [
            'id' => (string) $u->id,
            'nome' => $u->nome,
        ]),
]);
    }

    /**
     * Persistência do andamento
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'processo_id' => 'required|exists:processos,id',
            'descricao' => 'required|string|max:5000',
            'tipo_andamento' => 'nullable|string|max:255',
            'tipo_movimentacao' => 'nullable|string|max:255',
            'data_andamento' => now(),
            'data_prazo' => 'nullable|date|after_or_equal:data_andamento',
            'data_ciencia' => 'nullable|date',
            'status' => 'required|in:aberto,concluido,cancelado',
            'procurador_andamento_id' => 'nullable|exists:users,id',
            'assessor_andamento_id' => 'nullable|exists:users,id',
        ]);

        $validated['usuario_cadastro_id'] = Auth::id();

        Andamento::create($validated);

        return redirect()
            ->route('Andamentos/Cadastro')
            ->with('success', 'Andamento cadastrado com sucesso');
    }

    /**
     * Visualização detalhada do andamento
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
            'procuradores' => User::where('tipo', 'procurador')->select('id', 'name as nome')->get(),
            'assessores' => User::where('tipo', 'assessor')->select('id', 'name as nome')->get(),
        ]);
    }

    /**
     * Atualização
     */
    public function update(Request $request, Andamento $andamento)
    {
        $validated = $request->validate([
            'descricao' => 'required|string|max:5000',
            'tipo_andamento' => 'nullable|string|max:255',
            'tipo_movimentacao' => 'nullable|string|max:255',
            'data_andamento' => 'required|date',
            'data_prazo' => 'nullable|date|after_or_equal:data_andamento',
            'data_ciencia' => 'nullable|date',
            'status' => 'required|in:aberto,concluido,cancelado',
            'procurador_andamento_id' => 'nullable|exists:users,id',
            'assessor_andamento_id' => 'nullable|exists:users,id',
        ]);

        $andamento->update($validated);

        return redirect()
            ->route('andamentos.show', $andamento)
            ->with('success', 'Andamento atualizado com sucesso');
    }

    /**
     * Exclusão (se permitido)
     */
    public function destroy(Andamento $andamento)
    {
        $andamento->delete();

        return redirect()
            ->route('andamentos.index')
            ->with('success', 'Andamento removido');
    }
}
