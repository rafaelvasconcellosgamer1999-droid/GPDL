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
}
