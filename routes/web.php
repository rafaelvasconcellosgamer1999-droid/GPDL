<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\SetorController;
use App\Http\Controllers\Admin\CargoController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Admin\SolicitacaoController;
use App\Http\Controllers\Admin\PermissaoController;
use App\Http\Controllers\Admin\RegraController;
use App\Http\Controllers\Admin\EntidadeJuridicaController;
use App\Http\Controllers\Admin\TematicaController;
use App\Http\Controllers\Settings\PasswordController as SettingsPasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProcessoController;
use App\Http\Controllers\RelatoriosController;
use App\Http\Controllers\AndamentoController;
use App\Http\Controllers\SolicitarController;

use App\Models\Processos;

// Rota pública para envio de solicitação de acesso
Route::post('/solicitar-acesso', [SolicitarController::class, 'store'])->name('solicitacoes.store');

Route::get('/', function () {
    return redirect('/login');
});

// Troca obrigatória de senha (layout centrado)
Route::middleware(['auth'])->group(function () {
    Route::get('/trocar-senha', [SettingsPasswordController::class, 'first'])->name('password.force.edit');
    Route::post('/trocar-senha', [SettingsPasswordController::class, 'firstUpdate'])->name('password.force.update');
});

Route::middleware(['auth', 'verified', 'force.password.change'])->group(function () {

    // Dashboard (página inicial)
    Route::middleware(['permission:view_dashboard_page'])
        ->get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard.base');

    // ======================
    // PROCESSOS (ATUALIZADO)
    // ======================
    Route::middleware(['permission:view_process_page'])
        ->prefix('processos')     // Todas as rotas abaixo começam com /processos
        ->name('processos.')      // Todos os nomes abaixo começam com processos.
        ->group(function () {

            // Redirecionamento da raiz para a aba padrão
            Route::get('/', function () {
                return redirect()->route('processos.ativos');
            })->name('index');

            // Ações utilitárias
            Route::post('/set-setor', [ProcessoController::class, 'setSetor'])->name('set-setor');
            Route::post('/{id}/finalizar', [ProcessoController::class, 'finalizar'])->name('finalizar');


            // Visualização
            Route::get('/visualizar', [ProcessoController::class, 'visualizar'])->name('visualizar');

            // Cadastro Individual
            Route::get('/novo', [ProcessoController::class, 'create'])->name('create');
            Route::post('/', [ProcessoController::class, 'store'])->name('store'); // POST /processos

        });

    Route::get('/debug/processos-test', function () {
        return Processos::query()->limit(5)->get();
    });

    // ======================
    // ANDAMENTOS
    // ======================
    Route::middleware(['permission:view_process_page'])->group(function () {

        // Listagem geral de andamentos
        Route::get('/andamentos', [AndamentoController::class, 'index'])
            ->name('andamentos.index');

        // Cadastro de andamento (genérico ou contextual por processo)
        Route::get('/andamentos/cadastro', [AndamentoController::class, 'create'])
            ->name('andamentos.cadastro');

        // Persistência
        Route::post('/andamentos', [AndamentoController::class, 'store'])
            ->name('andamentos.store');

        // Visualização
        Route::get('/andamentos/{andamento}', [AndamentoController::class, 'show'])
            ->name('andamentos.show');

        // Edição
        Route::get('/andamentos/{andamento}/edit', [AndamentoController::class, 'edit'])
            ->name('andamentos.edit');

        // Atualização
        Route::put('/andamentos/{andamento}', [AndamentoController::class, 'update'])
            ->name('andamentos.update');

        // Exclusão (se permitido)
        Route::delete('/andamentos/{andamento}', [AndamentoController::class, 'destroy'])
            ->name('andamentos.destroy');
    });


    // ======================
    // AGENDA
    // ======================
    Route::middleware(['permission:view_agenda_page'])
        ->get('/agenda', fn() => Inertia\Inertia::render('Agenda/Index'))
        ->name('agenda.index');

    // ======================
    // RELATÓRIOS
    // ======================
    Route::middleware(['permission:view_reports_page'])->group(function () {
        Route::get('/relatorios', [RelatoriosController::class, 'index'])->name('relatorios.index');
        Route::get('/api/relatorios/total', [RelatoriosController::class, 'total']);
        Route::get('/api/relatorios/status', [RelatoriosController::class, 'processosPorStatus']);
        Route::get('/api/relatorios/procurador', [RelatoriosController::class, 'processosPorProcurador']);
        Route::get('/api/relatorios/assunto', [RelatoriosController::class, 'processosPorAssunto']);
    });

    // ======================
    // APIs de Busca (Autocomplete)
    // ======================
    Route::prefix('api')->group(function () {
        // Processos
        Route::get('processos/buscar', [SearchController::class, 'processos'])
            ->name('processos.buscar');
        Route::get('/processos', [ProcessoController::class, 'apiIndex']);
        Route::get('/processos/{id}', [ProcessoController::class, 'apiShow']);
        // Partes
        Route::get('/partes-existentes', [SearchController::class, 'partes'])->name('api.partes');
        // Entidades
        Route::get('tribunais', [SearchController::class, 'tribunais']);
        Route::get('orgao-julgador', [SearchController::class, 'orgaosJulgadores']);
        Route::get('orgao-origem', [SearchController::class, 'orgaosOrigem']);
        // Temáticas
        Route::get('acoes', [SearchController::class, 'acoes']);
        Route::get('assuntos', [SearchController::class, 'assuntos']);
    });

    // ======================
    // SQUADS
    // ======================
    Route::middleware(['permission:view_squads_page'])
        ->get('/squads', fn() => Inertia\Inertia::render('Squads/Index'))
        ->name('squads.index');

    // ======================
    // LOGS
    // ======================
    Route::middleware(['permission:view_logs_page'])
        ->get('/logs', fn() => Inertia\Inertia::render('Logs/Index'))
        ->name('logs.index');

    // ======================
    // AUDITORIA
    // ======================
    Route::middleware(['permission:view_audit_page'])
        ->get('/auditoria', fn() => Inertia\Inertia::render('Auditoria/Index'))
        ->name('auditoria.index');

    // ======================
    // ADMINISTRAÇÃO
    // ======================
    Route::middleware(['permission:view_admin_page'])->prefix('admin')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('admin.index');

        // Setores
        Route::get('setores', [SetorController::class, 'index'])->name('setores');
        Route::post('setores/criar', [SetorController::class, 'criarSetor'])->name('setores.criar');
        Route::post('setores/editar', [SetorController::class, 'editarSetor'])->name('setores.editar');
        Route::post('setores/toggle', [SetorController::class, 'toggleSetor'])->name('setores.toggle');

        // Cargos
        Route::get('cargos', [CargoController::class, 'index'])->name('cargos');
        Route::post('cargos/criar', [CargoController::class, 'criarCargo'])->name('cargos.criar');
        Route::post('cargos/editar', [CargoController::class, 'editarCargo'])->name('cargos.editar');
        Route::delete('cargos/excluir', [CargoController::class, 'excluirCargo'])->name('cargos.excluir');
        Route::post('cargos/toggle', [CargoController::class, 'toggleStatus'])->name('cargos.toggle');

        // Usuários
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios');
        Route::post('usuarios/atualizar', [UsuarioController::class, 'atualizar'])->name('usuarios.atualizar');
        Route::post('usuarios/resetar-senha', [UsuarioController::class, 'resetarSenha'])->name('usuarios.resetar-senha');
        Route::post('usuarios/desabilitar', [UsuarioController::class, 'desabilitar'])->name('usuarios.desabilitar');
        Route::post('usuarios/habilitar', [UsuarioController::class, 'habilitar'])->name('usuarios.habilitar');
        Route::delete('usuarios/excluir', [UsuarioController::class, 'excluir'])->name('usuarios.excluir');

        // Solicitações
        Route::get('solicitacoes', [SolicitacaoController::class, 'index'])->name('solicitacoes');
        Route::post('solicitacoes/aprovar', [SolicitacaoController::class, 'aprovarSolicitacao'])->name('solicitacoes.aprovar');
        Route::delete('solicitacoes/rejeitar', [SolicitacaoController::class, 'rejeitarSolicitacao'])->name('solicitacoes.rejeitar');

        // Permissões
        Route::get('permissoes', [PermissaoController::class, 'index'])->name('permissoes');
        Route::post('permissoes/criar', [PermissaoController::class, 'criarPermissao'])->name('permissoes.criar');
        Route::post('permissoes/editar', [PermissaoController::class, 'editarPermissao'])->name('permissoes.editar');
        Route::delete('permissoes/{permissao}', [PermissaoController::class, 'excluirPermissao'])->name('permissoes.excluir');

        // Regras
        Route::get('regras', [RegraController::class, 'index'])->name('regras.index');
        Route::post('regras/criar', [RegraController::class, 'criarRegra'])->name('regras.criar');
        Route::post('regras/atualizar', [RegraController::class, 'atualizarRegra'])->name('regras.atualizar');
        Route::delete('regras/excluir', [RegraController::class, 'excluirRegra'])->name('regras.excluir');

        // Temáticas
        Route::get('tematicas', [TematicaController::class, 'index']);
        Route::post('tematicas/criar', [TematicaController::class, 'criarTematica']);
        Route::post('tematicas/editar', [TematicaController::class, 'editarTematica']);
        Route::post('tematicas/deletar', [TematicaController::class, 'deletarTematica']);

        // Entidades Jurídicas
        Route::get('entidades-juridicas', [EntidadeJuridicaController::class, 'index']);
        Route::post('entidades-juridicas/criar', [EntidadeJuridicaController::class, 'criarEntidade']);
        Route::post('entidades-juridicas/editar', [EntidadeJuridicaController::class, 'editarEntidade']);
        Route::post('entidades-juridicas/deletar', [EntidadeJuridicaController::class, 'deletarEntidade']);
        Route::post('entidades-juridicas/toggle', [EntidadeJuridicaController::class, 'toggleEntidade']);

    });

    // ======================
    // CONFIGURAÇÕES
    // ======================
    Route::get('/settings/password', [SettingsPasswordController::class, 'edit'])->name('settings.password.edit');
    Route::put('/settings/password', [SettingsPasswordController::class, 'update'])->name('settings.password.update');
});