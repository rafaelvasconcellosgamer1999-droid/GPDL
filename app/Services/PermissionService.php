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
        // Administradores têm todas as permissões
        if ($user->cargo && $user->cargo->is_administrador) {
            // Retorne um mapa vazio ou com todas as permissões pré‑carregadas
            // conforme sua regra de negócio. Aqui retornamos vazio e tratamos
            // admin no método hasPermission().
            return [];
        }

        $permissions = [];

        $regras = $user->cargo?->permissoes ?? collect();
        foreach ($regras as $permissao) {
            $key = $permissao->chave;
            $scope = $permissao->pivot->scope_id;  // ex: 1 = próprio, 2 = setor, 3 = todos
            $setorId = $permissao->pivot->setor_id;

            // Salva a permissão com seu nível. Você pode customizar o formato
            $permissions[$key] = [
                'scope' => $scope,
                'setor_id' => $setorId,
            ];
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
