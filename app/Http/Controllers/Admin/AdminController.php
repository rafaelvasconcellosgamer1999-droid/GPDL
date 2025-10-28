<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Setor;
use App\Models\Cargo;
use App\Models\Solicitacao;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'usuarios' => User::count(),
            'setores' => Setor::count(),
            'cargos' => Cargo::count(),
            'solicitacoes_pendentes' => Solicitacao::count(),
        ];

        return Inertia::render('Admin/Index', [
            'stats' => $stats
        ]);
    }
}
