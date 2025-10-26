<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * If the authenticated user must change the temporary password,
     * force a redirect to the password update page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ($user->precisa_trocar_senha ?? false)) {
            $path = $request->path();

            // Allow these paths without redirection
            $allowed = [
                'trocar-senha',
                'settings/password',
                'logout',
                'two-factor-challenge',
                'verify-email',
                'email/verification-notification',
            ];

            foreach ($allowed as $allow) {
                if ($request->is($allow)) {
                    return $next($request);
                }
            }

            // Only redirect for GET requests to avoid interfering with POSTs
            if ($request->method() === 'GET') {
                return redirect('/trocar-senha')->with('status', 'Defina uma nova senha para continuar.');
            }
        }

        return $next($request);
    }
}
