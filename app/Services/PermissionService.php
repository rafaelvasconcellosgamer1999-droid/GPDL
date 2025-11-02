<?php

namespace App\Services;

use App\Models\User;

class PermissionService
{
    /**
     * Monta o mapa de permissões do usuário agrupando por chave.
     * @return array<string, mixed>|null Ex.: ['view_process' => true, 'manage_users' => 'sector']
     */
    public function getUserPermissions(User $user): ?array
    {
        // Administrador tem todas as permissões
        if ($user->cargo && $user->cargo->is_administrador) {
            return null; // Inertia envia undefined → front entende como full access
        }

        $permissions = [];
        $userSetor = $user->setor_id;

        foreach ($user->cargo?->permissoes ?? [] as $permissao) {
            $key = $permissao->chave;
            $scope = $permissao->pivot->scope_id;
            $ruleSetorId = $permissao->pivot->setor_id ?? null;

            switch ($scope) {
                case 3: // all
                    $permissions[$key] = 'all';
                    break;
                case 2: // sector
                    if ($ruleSetorId === null || $ruleSetorId === $userSetor) {
                        $permissions[$key] = 'sector';
                    }
                    break;
                case 1: // own
                    $permissions[$key] = true;
                    break;
            }
        }

        return $permissions;
    }

    /**
     * Verifica se o usuário possui a permissão informada, considerando escopo e setor.
     */
    public function hasPermission(User $user, string $permissionKey, ?int $setorId = null): bool
    {
        // Administrador sempre tem permissão
        if ($user->cargo && $user->cargo->is_administrador) {
            return true;
        }

        $permissions = $this->getUserPermissions($user);
        $data = $permissions[$permissionKey] ?? null;

        if (!$data) {
            return false;
        }

        switch ($data) {
            case 'all':
                return true;
            case 'sector':
                return $setorId === null || $user->setor_id === $setorId;
            case true:
                return true;
            default:
                return false;
        }
    }
}
