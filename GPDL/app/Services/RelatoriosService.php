<?php

namespace App\Services;

use App\Models\Processo;
use Illuminate\Support\Facades\DB;

class RelatoriosService
{
    /**
     * 📊 Contagem de processos por status
     */
    public static function contarPorStatus(): array
    {
        return [
            'abertos' => Processo::abertos()->count(),
            'pendentes_ciencia' => Processo::pendentesCiencia()->count(),
            'vencidos' => Processo::vencidos()->count(),
            'finalizados' => Processo::finalizados()->count(),
        ];
    }

    /**
     * 👥 Processos agrupados por procurador
     */
    public static function contarPorProcurador(): array
    {
        return DB::table('processos as p')
            ->join('usuarios as u', 'u.id', '=', 'p.procurador_responsavel_id')
            ->select('u.nome', DB::raw('COUNT(p.id) as total'))
            ->groupBy('u.nome')
            ->orderByDesc('total')
            ->get()
            ->toArray();
    }

    /**
     * 📚 Processos agrupados por assunto
     */
    public static function contarPorAssunto(): array
    {
        return DB::table('processos')
            ->select('assunto', DB::raw('COUNT(id) as total'))
            ->whereNotNull('assunto')
            ->groupBy('assunto')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->toArray();
    }

    /**
     * 🧮 Contagem total de processos
     */
    public static function contarTotal(): int
    {
        return DB::table('processos')->count();
    }
}
