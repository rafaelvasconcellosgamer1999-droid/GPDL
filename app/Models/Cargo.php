<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    protected $table = 'cargos';

    protected $fillable = [
        'nome',
        'status',
    ];

    /*
     * Relacionamento com usuários. Cada cargo pode ter muitos usuários.
     */
    public function usuarios()
    {
        return $this->hasMany(User::class, 'cargo_id');
    }

    /*
     * Relacionamento com permissões.
     * Usa a nova pivot `cargo_permissoes`, que não contém mais `scope_id`.
     * `setor_id` (no pivot) é opcional: se null, a permissão é global.
     */
    public function permissoes()
    {
        return $this->belongsToMany(
            Permissao::class,
            'cargo_permissoes',  // novo nome da pivot
            'cargo_id',
            'permissao_id'
        )->withPivot(['scope_id', 'setor_id']);
        
    }

    /*
     * Mutator para garantir que o status seja armazenado como booleano.
     */
    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = (bool) $value;
    }

    /*
     * Accessor para retornar o status em formato legível.
     */
    public function getStatusLabelAttribute()
    {
        return $this->status ? 'Ativo' : 'Inativo';
    }

    /*
     * Accessor opcional para verificar se este cargo é do tipo Administrador.
     * Útil para simplificar checagens de permissão.
     */
    public function getIsAdministradorAttribute(): bool
    {
        return strtolower($this->nome) === 'administrador';
    }
}
