<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;

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
    protected $appends = ['name', 'ativo', 'escopo_padrao'];

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

    /**
     * Calcula o escopo padrão do usuário (own, sector ou all)
     * com base na tabela cargo_setor_scope. Este método é exposto
     * no frontend via $appends como 'escopo_padrao'.
     */
    public function getEscopoPadraoAttribute(): string
    {
        $registro = DB::table('cargo_setor_scope')
            ->join('scopes', 'scopes.id', '=', 'cargo_setor_scope.scope_id')
            ->where('cargo_setor_scope.cargo_id', $this->cargo_id)
            ->where('cargo_setor_scope.setor_id', $this->setor_id)
            ->select('scopes.nome')
            ->first();

        return $registro ? $registro->nome : 'own';
    }

    /**
     * Verifica se o usuário possui determinada permissão.
     *
     * @param string $permissaoKey Nome ou slug da permissão (ex: 'processos.ver').
     * @param int|null $setorId    Opcional: setor-alvo; se null, usa setor do próprio usuário.
     * @return bool
     */
    public function hasPermission(string $permissaoKey, ?int $setorId = null): bool
    {
        // Se for administrador, concede acesso total
        if ($this->cargo && strtolower($this->cargo->nome) === 'administrador') {
            return true;
        }

        // Usa o setor do próprio usuário caso não seja passado
        $setorId = $setorId ?? $this->setor_id;

        // Procura permissão na tabela cargo_permissoes (global ou restrita ao setor)
        return DB::table('cargo_permissoes as cp')
            ->join('permissoes as p', 'p.id', '=', 'cp.permissao_id')
            ->where('cp.cargo_id', $this->cargo_id)
            ->where('p.chave', $permissaoKey) // use p.chave se você incluir a coluna 'chave' em permissoes
            ->where(function ($query) use ($setorId) {
                $query->whereNull('cp.setor_id')
                      ->orWhere('cp.setor_id', $setorId);
            })
            ->exists();
    }

    /**
     * Atalho para verificar se possui permissão sem restrição de setor.
     */
    public function canDo(string $permissaoKey): bool
    {
        return $this->hasPermission($permissaoKey, null);
    }
}
