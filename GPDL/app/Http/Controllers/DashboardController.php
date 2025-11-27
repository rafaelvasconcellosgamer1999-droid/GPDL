<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $availableViews = [
            'ativos',
            'pendentes',
            'vencidos',
            'encerrados',
            'ativos_hoje',
            'ativos_48h',
        ];

        $capView = request()->query('cap_view');

        if (!in_array($capView, $availableViews, true)) {
            $capView = 'ativos';
        }

        return Inertia::render('dashboard', [
            'stats' => DashboardService::gerarEstatisticas(),
            'emAndamento' => DashboardService::listarEmAndamento(),
            'capacidade' => DashboardService::capacidadePorResponsavel($capView),
            'features' => ['processos' => Schema::hasTable('processos')],
            'capView' => $capView,
        ]);
    }
}
