<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SolicitacaoController;
use App\Http\Controllers\Settings\PasswordController as SettingsPasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProcessoController;
use App\Models\User;



// Rota pÃºblica para envio de solicitaÃ§Ã£o de acesso
Route::post('/solicitar-acesso', [SolicitacaoController::class, 'store'])->name('solicitacoes.store');

// Troca obrigatÃ³ria de senha (layout centrado)
Route::middleware(['auth'])->group(function () {
    Route::get('/trocar-senha', [SettingsPasswordController::class, 'first'])->name('password.force.edit');
    Route::post('/trocar-senha', [SettingsPasswordController::class, 'firstUpdate'])->name('password.force.update');
});

Route::middleware(['auth', 'verified', 'force.password.change'])->group(function () {

    // NavegaÃ§Ã£o principal (estrutura base)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.base');

    Route::get('/processos', [ProcessoController::class, 'index'])->name('processos.index');

    Route::post('/processos/importar-lote', [ProcessoController::class, 'importarLote'])->name('processos.importarLote');
    Route::post('/processos/{id}/finalizar', [ProcessoController::class, 'finalizar'])->name('processos.finalizar');
    Route::post('/processos/finalizar-lote', [ProcessoController::class, 'finalizarLote'])->name('processos.finalizarLote');

    Route::get('/agenda', function () {
        return Inertia\Inertia::render('Agenda/Index');
    })->name('agenda.index');

    Route::get('/relatorios', function () {
        return Inertia\Inertia::render('Relatorios/Index');
    })->name('relatorios.index');

    Route::get('/squads', function () {
        return Inertia\Inertia::render('Squads/Index');
    })->name('squads.index');

    Route::get('/logs', function () {
        return Inertia\Inertia::render('Logs/Index');
    })->name('logs.index');

    Route::get('/auditoria', function () {
        return Inertia\Inertia::render('Auditoria/Index');
    })->name('auditoria.index');

    // ========== ADMIN ==========
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');

        // Setores
        Route::get('setores', [AdminController::class, 'setores'])->name('setores');
        Route::post('setores/criar', [AdminController::class, 'criarSetor'])->name('setores.criar');
        Route::post('setores/editar', [AdminController::class, 'editarSetor'])->name('setores.editar');
        Route::post('setores/toggle', [AdminController::class, 'toggleSetor'])->name('setores.toggle');

        // Cargos
        Route::get('cargos', [AdminController::class, 'cargos'])->name('cargos');
        Route::post('cargos/criar', [AdminController::class, 'criarCargo'])->name('cargos.criar');
        Route::post('cargos/editar', [AdminController::class, 'editarCargo'])->name('cargos.editar');
        Route::delete('cargos/excluir', [AdminController::class, 'excluirCargo'])->name('cargos.excluir');

        // UsuÃ¡rios
        Route::get('usuarios', [AdminController::class, 'usuarios'])->name('usuarios');
        Route::post('usuarios/atualizar', [AdminController::class, 'atualizarUsuario'])->name('usuarios.atualizar');
        Route::post('usuarios/resetar-senha', [AdminController::class, 'resetarSenhaUsuario'])->name('usuarios.resetar-senha');
        Route::post('usuarios/desabilitar', [AdminController::class, 'desabilitarUsuario'])->name('usuarios.desabilitar');
        Route::post('usuarios/habilitar', [AdminController::class, 'habilitarUsuario'])->name('usuarios.habilitar');

        // SolicitaÃ§Ãµes
        Route::get('solicitacoes', [AdminController::class, 'solicitacoes'])->name('solicitacoes');
        Route::post('solicitacoes/aprovar', [AdminController::class, 'aprovarSolicitacao'])->name('solicitacoes.aprovar');
        Route::delete('solicitacoes/rejeitar', [AdminController::class, 'rejeitarSolicitacao'])->name('solicitacoes.rejeitar');

        // ADICIONE AQUI ðŸ‘‡
        // PermissÃµes
        Route::get('permissoes', [AdminController::class, 'permissoes'])->name('permissoes');
        Route::post('permissoes/criar', [AdminController::class, 'criarPermissao'])->name('permissoes.criar');
        Route::post('permissoes/editar', [AdminController::class, 'editarPermissao'])->name('permissoes.editar');
        Route::delete('permissoes/excluir', [AdminController::class, 'excluirPermissao'])->name('permissoes.excluir');

        // Regras
        Route::get('regras', [AdminController::class, 'regras'])->name('regras');
        Route::post('regras/criar', [AdminController::class, 'criarRegra'])->name('regras.criar');
        Route::post('regras/atualizar', [AdminController::class, 'atualizarRegra'])->name('regras.atualizar');
        Route::delete('regras/excluir', [AdminController::class, 'excluirRegra'])->name('regras.excluir');
    });
    // ConfiguraÃ§Ãµes de senha (via layout do app)
    Route::get('/settings/password', [SettingsPasswordController::class, 'edit'])->name('settings.password.edit');
    Route::put('/settings/password', [SettingsPasswordController::class, 'update'])->name('settings.password.update');
});


