<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Setor;
use App\Models\Cargo;
use App\Models\Solicitacao;
use App\Models\Tematicas;
use App\Models\EntidadesJuridicas;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'usuarios'               => User::count(),
            'setores'                => Setor::count(),
            'cargos'                 => Cargo::count(),
            'solicitacoes_pendentes' => Solicitacao::count(),
            'tematicas'              => Tematicas::count(),
            'entidades'              => EntidadesJuridicas::count(),
        ];

        return Inertia::render('Admin/Index', [
            'stats' => $stats
        ]);
    }
}
