<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $table = 'usuarios';

    const CREATED_AT = 'data_criacao';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome',
        'email',
        'usuarioRede',
        'senha',
        'cargo_id',
        'setor_id',
        'status',
        'precisa_trocar_senha',
        'email_verified_at',
    ];

    protected $hidden = [
        'senha',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'senha' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
        'status' => 'boolean',
        'precisa_trocar_senha' => 'boolean',
    ];

    /**
     * Lista de atributos calculados que devem ser serializados
     * para o frontend (por exemplo, com Inertia).
     */
    protected $appends = ['name', 'ativo'];

    // IMPORTANTE: Laravel usa 'password', mas seu banco usa 'senha'
    public function getAuthPassword()
    {
        return $this->senha;
    }

    // Accessor para o nome (Laravel espera 'name')
    public function getNameAttribute()
    {
        return $this->nome;
    }

    // Accessor para mapear 'status' -> 'ativo' no frontend
    public function getAtivoAttribute()
    {
        return (bool) $this->status;
    }

    // Mutator para mapear 'ativo' -> 'status' quando receber do frontend
    public function setAtivoAttribute($value)
    {
        $this->attributes['status'] = $value ? 1 : 0;
    }

    // Relationships
    public function cargo()
    {
        return $this->belongsTo(Cargo::class);
    }

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }

    // Scopes
    public function scopeAtivos($query)
    {
        return $query->where('status', 1);
    }

    public function scopeInativos($query)
    {
        return $query->where('status', 0);
    }

}
