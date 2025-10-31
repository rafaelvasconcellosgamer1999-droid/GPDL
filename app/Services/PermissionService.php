<?php

namespace App\Services;

use App\Models\User;

class PermissionService
{
    /**
     * Monta o mapa de permissões do usuário agrupando por chave.
     * @return array<string, mixed> Ex.: ['view_process' => true, 'manage_users' => 'sector']
     */
    public function getUserPermissions(User $user): array
{
     if ($user->cargo && $user->cargo->is_administrador) {
        return null;  // Inertia enviará undefined
    }

    $permissions = [];
    foreach ($user->cargo?->permissoes ?? [] as $permissao) {
        $key   = $permissao->chave;
        $scope = $permissao->pivot->scope_id;
        // Converte o scope numérico para string que o front‑end entende:
        switch ($scope) {
            case 3:
                // todos os níveis: ['all','total',...]
                $permissions[$key] = 'all';
                break;
            case 2:
                // apenas setor: ['sector','setor']
                $permissions[$key] = 'sector';
                break;
            case 1:
                // apenas próprio recurso; para itens sem levels pode ser true
                $permissions[$key] = true;
                break;
            default:
                $permissions[$key] = true;
        }
    }
    return $permissions;
}

    /**
     * Verifica se o usuário possui a permissão informada, considerando escopo e setor.
     */
    public function hasPermission(User $user, string $permissionKey, ?int $setorId = null): bool
    {
        // Administradores têm todas as permissões
        if ($user->cargo && $user->cargo->is_administrador) {
            return true;
        }

        $permissions = $this->getUserPermissions($user);
        $data = $permissions[$permissionKey] ?? null;
        if (!$data) {
            return false;
        }

        // Exemplo simples: 1 = own, 2 = sector, 3 = all.
        switch ($data['scope']) {
            case 3: // all
                return true;
            case 2: // sector
                return $data['setor_id'] === null || $data['setor_id'] === $setorId;
            case 1: // own
                // Para escopo próprio, verifique se o usuário é dono do recurso
                // Essa verificação deve ser feita onde você tem o recurso (ex.: controller)
                return true;
            default:
                return false;
        }
    }
}
