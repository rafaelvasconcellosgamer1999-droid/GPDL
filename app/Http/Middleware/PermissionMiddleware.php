<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

        if (!$user) {
            return redirect()->route('login');
        }

        $permissionService = new PermissionService();

        if (!$permissionService->hasPermission($user, $permissionKey)) {

            // 🔒 REGISTRO AUTOMÁTICO DE TENTATIVA NEGADA
            Log::channel('daily')->warning('[GPDL] Acesso negado', [
                'usuario_id'   => $user->id,
                'nome'         => $user->nome ?? $user->email ?? 'Desconhecido',
                'cargo'        => $user->cargo->nome ?? 'Sem cargo',
                'setor'        => $user->setor->nome ?? 'Sem setor',
                'permissao'    => $permissionKey,
                'rota'         => $request->route()?->getName() ?? $request->path(),
                'ip'           => $request->ip(),
                'timestamp'    => now()->toDateTimeString(),
                'user_agent'   => $request->header('User-Agent'),
            ]);

            // ⚠️ Página amigável de acesso negado
            return Inertia::render('Errors/Forbidden', [
                'message' => 'Você não tem permissão para acessar esta página.',
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
