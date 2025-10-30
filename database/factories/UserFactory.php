<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nome = fake()->name();
        $usuarioRede = Str::slug(fake()->unique()->userName(), '.');

        return [
            'nome' => $nome,
            'email' => fake()->unique()->safeEmail(),
            'usuarioRede' => $usuarioRede,
            'senha' => static::$password ??= 'password',
            'email_verified_at' => now(),
            'cargo_id' => null,
            'setor_id' => null,
            'status' => true,
            'precisa_trocar_senha' => false,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model does not have two-factor authentication configured.
     */
    public function withoutTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => []);
    }
}
