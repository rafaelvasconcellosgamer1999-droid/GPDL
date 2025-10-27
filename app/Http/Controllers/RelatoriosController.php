<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class RelatoriosController extends Controller
{
    public function index()
    {
        return Inertia::render('Relatorios/Index');
    }
    public function total()
    {
        $total = DB::table('processos')->count();
        return response()->json(['total' => $total]);
    }

    // 📈 Processos por status
    public function processosPorStatus()
    {
        // ✅ Garante que a tabela existe
        if (!Schema::hasTable('processos')) {
            return response()->json([
                'pendentes_ciencia' => 0,
                'abertos' => 0,
                'finalizados' => 0,
            ]);
        }

        // ✅ Lista as colunas existentes
        $cols = Schema::getColumnListing('processos');

        // Só usa as que existem no seu banco
        $temDataCiencia = in_array('data_ciencia', $cols, true);
        $temDataFinalizacao = in_array('data_finalizacao', $cols, true);
        $temConcluido = in_array('concluido', $cols, true);

        $query = DB::table('processos');

        // 🟡 Pendente de ciência → sem data_ciencia
        $queryPendentes = clone $query;
        if ($temDataCiencia) {
            $queryPendentes->whereNull('data_ciencia');
        }

        // 🔵 Abertos → com ciência, sem finalização nem concluído
        $queryAbertos = clone $query;
        if ($temDataCiencia) $queryAbertos->whereNotNull('data_ciencia');
        if ($temDataFinalizacao) $queryAbertos->whereNull('data_finalizacao');
        if ($temConcluido) {
            $queryAbertos->where(function ($q) {
                $q->whereNull('concluido')->orWhere('concluido', '!=', 1);
            });
        }

        // 🔴 Finalizados → com data_finalizacao ou concluido = 1
        $queryFinalizados = clone $query;
        if ($temDataFinalizacao) $queryFinalizados->whereNotNull('data_finalizacao');
        if ($temConcluido) $queryFinalizados->orWhere('concluido', 1);

        // ✅ Executa contagens
        $dados = [
            'pendentes_ciencia' => $queryPendentes->count(),
            'abertos' => $queryAbertos->count(),
            'finalizados' => $queryFinalizados->count(),
        ];

        // ✅ Calcula percentuais
        $total = max(1, array_sum($dados));
        foreach ($dados as $k => $v) {
            $dados[$k . '_percent'] = round(($v / $total) * 100, 1);
        }

        return response()->json($dados);
    }

    // 👥 Processos por procurador
    public function processosPorProcurador()
    {
        $dados = DB::table('processos as p')
            ->join('usuarios as u', 'u.id', '=', 'p.procurador_responsavel_id')
            ->select('u.nome', DB::raw('COUNT(p.id) as total'))
            ->groupBy('u.nome')
            ->orderByDesc('total')
            ->get();

        return response()->json($dados);
    }

    // 📚 Processos por assunto
    public function processosPorAssunto()
    {
        $dados = DB::table('processos')
            ->select('assunto', DB::raw('COUNT(id) as total'))
            ->whereNotNull('assunto')
            ->groupBy('assunto')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json($dados);
    }
}
