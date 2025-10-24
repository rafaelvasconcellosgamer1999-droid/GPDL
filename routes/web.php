<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;



Route::middleware(['auth', 'verified'])->group(function () {

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

        // Usuários
        Route::get('usuarios', [AdminController::class, 'usuarios'])->name('usuarios');
        Route::post('usuarios/atualizar', [AdminController::class, 'atualizarUsuario'])->name('usuarios.atualizar');
        Route::post('usuarios/resetar-senha', [AdminController::class, 'resetarSenhaUsuario'])->name('usuarios.resetar-senha');
        Route::post('usuarios/desabilitar', [AdminController::class, 'desabilitarUsuario'])->name('usuarios.desabilitar');
        Route::post('usuarios/habilitar', [AdminController::class, 'habilitarUsuario'])->name('usuarios.habilitar');

        // Solicitações
        Route::get('solicitacoes', [AdminController::class, 'solicitacoes'])->name('solicitacoes');
        Route::post('solicitacoes/aprovar', [AdminController::class, 'aprovarSolicitacao'])->name('solicitacoes.aprovar');
        Route::delete('solicitacoes/rejeitar', [AdminController::class, 'rejeitarSolicitacao'])->name('solicitacoes.rejeitar');

        // ADICIONE AQUI 👇
        // Permissões
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
});
