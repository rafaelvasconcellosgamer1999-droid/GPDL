<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LogoutResponse;
use Inertia\Inertia;

class CustomLogoutResponse implements LogoutResponse
{
    /**
     * Responde ao logout.
     */
    public function toResponse($request)
    {
        // 👇 Corrige o flash 404 ao sair de apps Inertia
        if ($request->inertia()) {
            return Inertia::location('/login');
        }

        return redirect('/login');
    }
}
