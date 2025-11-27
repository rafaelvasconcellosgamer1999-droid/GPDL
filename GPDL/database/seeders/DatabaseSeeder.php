<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrNew(['email' => 'test@example.com']);

        $user->fill([
            'nome' => 'Test User',
            'usuarioRede' => 'test.user',
            'senha' => 'password',
            'status' => true,
            'precisa_trocar_senha' => false,
            'cargo_id' => null,
            'setor_id' => null,
        ]);

        if (empty($user->email_verified_at)) {
            $user->email_verified_at = now();
        }

        $user->save();
    }
}
