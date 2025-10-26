<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            // O modelo User usa coluna 'senha' (hash via cast)
            'senha' => $validated['password'],
            'precisa_trocar_senha' => false,
        ]);

        return back()->with('success', 'Senha atualizada com sucesso.');
    }

    /**
     * First access/forced password change view (minimal, central card)
     */
    public function first(): Response
    {
        return Inertia::render('auth/force-password');
    }

    /**
     * Handle forced password change (no current password required).
     */
    public function firstUpdate(Request $request): RedirectResponse
    {
        if (! ($request->user()?->precisa_trocar_senha ?? false)) {
            return redirect('/dashboard');
        }

        $validated = $request->validate([
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'senha' => $validated['password'],
            'precisa_trocar_senha' => false,
        ]);

        return redirect('/dashboard')->with('success', 'Senha atualizada. Bem-vindo!');
    }
}
