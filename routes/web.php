<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\SetorController;
use App\Http\Controllers\Admin\CargoController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Admin\SolicitacaoController;
use App\Http\Controllers\SolicitarController;
use App\Http\Controllers\Admin\PermissaoController;
use App\Http\Controllers\Admin\RegraController;


use App\Http\Controllers\Settings\PasswordController as SettingsPasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProcessoController;
use App\Http\Controllers\RelatoriosController;




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

    // Navegação principal (estrutura base)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.base');

    // Grupo de processos protegido por permissão de visualização
    Route::middleware(['auth', 'permission:view_process_page'])->group(function () {
        Route::get('/processos', [ProcessoController::class, 'index'])->name('processos.index');
        Route::post('/processos/importar-lote', [ProcessoController::class, 'importarLote'])->name('processos.importarLote');
        Route::post('/processos/{id}/finalizar', [ProcessoController::class, 'finalizar'])->name('processos.finalizar');
    });
    Route::get('/agenda', function () {return Inertia\Inertia::render('Agenda/Index');})->name('agenda.index');

    Route::get('/squads', function () {return Inertia\Inertia::render('Squads/Index');})->name('squads.index');

    Route::get('/logs', function () {return Inertia\Inertia::render('Logs/Index');})->name('logs.index');

    Route::get('/auditoria', function () {return Inertia\Inertia::render('Auditoria/Index');})->name('auditoria.index');


    Route::get('/relatorios', [RelatoriosController::class, 'index'])->name('relatorios.index');
    Route::get('/api/relatorios/total', [RelatoriosController::class, 'total']);

    // Rotas AJAX
    Route::get('/api/relatorios/status', [RelatoriosController::class, 'processosPorStatus']);
    Route::get('/api/relatorios/procurador', [RelatoriosController::class, 'processosPorProcurador']);
    Route::get('/api/relatorios/assunto', [RelatoriosController::class, 'processosPorAssunto']);

    // ========== ADMIN ==========
    Route::middleware(['auth','permission:view_admin_page'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('admin.index');

        // Setores
        Route::get('setores', [SetorController::class, 'index'])->name('setores');
        Route::post('setores/criar', [SetorController::class, 'criarSetor'])->name('setores.criar');
        Route::post('setores/editar', [SetorController::class, 'editarSetor'])->name('setores.editar');
        Route::post('setores/toggle', [SetorController::class, 'toggleSetor'])->name('setores.toggle');

        // Cargos
        // Listar cargos
        Route::get('cargos', [CargoController::class, 'index'])->name('cargos');

        // Criar cargo
        Route::post('cargos/criar', [CargoController::class, 'criarCargo'])->name('cargos.criar');

        // Editar cargo
        Route::post('cargos/editar', [CargoController::class, 'editarCargo'])->name('cargos.editar');

        // Excluir cargo
        Route::delete('cargos/excluir', [CargoController::class, 'excluirCargo'])->name('cargos.excluir');

        // Alterar status do cargo (ativo/inativo)
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
        Route::delete('permissoes/{permissao}', [PermissaoController::class, 'excluirPermissao'])
            ->name('permissoes.excluir');
        // Regras       
        Route::get('regras', [RegraController::class, 'index'])->name('regras.index');
        Route::post('regras/criar', [RegraController::class, 'criarRegra'])->name('regras.criar');
        Route::post('regras/atualizar', [RegraController::class, 'atualizarRegra'])->name('regras.atualizar');
        Route::delete('regras/excluir', [RegraController::class, 'excluirRegra'])->name('regras.excluir');
    });
    // Configurações de senha (via layout do app)
    Route::get('/settings/password', [SettingsPasswordController::class, 'edit'])->name('settings.password.edit');
    Route::put('/settings/password', [SettingsPasswordController::class, 'update'])->name('settings.password.update');
});
