<?php

namespace App\Http\Controllers;

use App\Services\RelatoriosService;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class RelatoriosController extends Controller
{
    public function index()
    {
        return Inertia::render('Relatorios/Index');
    }

    public function total(): JsonResponse
    {
        return response()->json(['total' => RelatoriosService::contarTotal()]);
    }

    public function processosPorStatus(): JsonResponse
    {
        return response()->json(RelatoriosService::contarPorStatus());
    }

    public function processosPorProcurador(): JsonResponse
    {
        return response()->json(RelatoriosService::contarPorProcurador());
    }

    public function processosPorAssunto(): JsonResponse
    {
        return response()->json(RelatoriosService::contarPorAssunto());
    }
}
