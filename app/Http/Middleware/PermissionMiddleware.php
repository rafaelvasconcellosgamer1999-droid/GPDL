<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\PermissionService;

class PermissionMiddleware
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permissionKey  Chave da permissão a ser verificada
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permissionKey)
    {
        $user = Auth::user();
        if (!$user || !$this->permissionService->hasPermission($user, $permissionKey)) {
            abort(403, 'Acesso negado.');
        }

        return $next($request);
    }
}
