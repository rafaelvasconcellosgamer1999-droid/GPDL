<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $capView = request()->query('cap_view', 'ativos');

        return Inertia::render('dashboard', [
            'stats' => DashboardService::gerarEstatisticas(),
            'emAndamento' => DashboardService::listarEmAndamento(),
            'capacidade' => DashboardService::capacidadePorResponsavel($capView),
            'features' => ['processos' => Schema::hasTable('processos')],
            'capView' => $capView,
        ]);
    }
}
