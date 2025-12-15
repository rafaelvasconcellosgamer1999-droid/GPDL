<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EntidadesJuridicas;
use App\Models\Partes;
use App\Models\Processos;
use App\Models\Tematicas;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    // 1. Processos
    public function processos(Request $request)
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 3) return response()->json([]);

        $results = Processos::query()
            ->with('procuradorResponsavel:id,nome')
            ->where('cnj', 'like', "%{$q}%")
            ->orderBy('cnj')
            ->limit(10)
            ->get(['id', 'cnj', 'procurador_responsavel_id']);

        return response()->json($results->map(fn($p) => [
            'id' => $p->id,
            'nome' => $p->cnj,
            'procurador_responsavel_id' => $p->procurador_responsavel_id,
            'procurador_responsavel_nome' => $p->procuradorResponsavel?->nome,
        ]));
    }

    // 2. Partes (Pessoas/Empresas)
    public function partes(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        if (strlen($search) < 3) return response()->json(['data' => []]);

        $results = Partes::query()
            ->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf_cnpj', 'like', "%{$search}%");
            })
            ->limit(15)
            ->get(['id', 'nome', 'cpf_cnpj']);

        return response()->json([
            'data' => $results->map(fn($p) => [
                'id' => (string) $p->id,
                'nome' => $p->nome,
                'cpf' => $p->cpf_cnpj,
            ])
        ]);
    }

    // 3. Entidades Jurídicas
    public function tribunais(Request $request)
    {
        return $this->performSearch('Tribunal', $request);
    }

    public function orgaosJulgadores(Request $request)
    {
        return $this->performSearch('Órgão Julgador', $request);
    }

    public function orgaosOrigem(Request $request)
    {
        return $this->performSearch('orgao_origem', $request);
    }

    // 4. Temáticas
    public function acoes(Request $request)
    {
        return $this->performSearchTematica('acao', $request);
    }

    public function assuntos(Request $request)
    {
        return $this->performSearchTematica('assunto', $request);
    }

    // --- MÉTODOS PRIVADOS (Helpers) ---

    private function performSearch(string $tipo, Request $request)
    {
        $term = trim($request->query('search', ''));
        // if (strlen($term) < 3) return response()->json(['data' => []]);

        $query = EntidadesJuridicas::query()->where('tipo', $tipo);

        if (!empty($term)) {
            $query->where(function (Builder $q) use ($term) {
                $q->where('nome', 'like', "%{$term}%")
                  ->orWhere('sigla', 'like', "%{$term}%");
            });
        }

        $results = $query->limit(10)->get(['id', 'nome']);

        return response()->json([
            'data' => $results->map(fn($item) => ['id' => $item->id, 'nome' => $item->nome])
        ]);
    }

    private function performSearchTematica(string $tipo, Request $request)
    {
        $term = trim($request->query('search', ''));
        
        $query = Tematicas::query()->where('tipo', $tipo);

        if (!empty($term)) {
            $query->where('nome', 'like', "%{$term}%");
        }

        $results = $query->limit(10)->get(['id', 'nome']);

        return response()->json([
            'data' => $results->map(fn($item) => ['id' => $item->id, 'nome' => $item->nome])
        ]);
    }
}