<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    protected $table = 'cargos';

    protected $fillable = [
        'nome',
        'status',  // Certifique-se de incluir 'status' no $fillable
    ];

    // Relacionamentos
    public function usuarios()
    {
        return $this->hasMany(User::class, 'cargo_id');
    }

    public function permissoes()
    {
        return $this->belongsToMany(
            Permissao::class,
            'cargo_permissoes_scoped',
            'cargo_id',
            'permissao_id'
        )->withPivot(['scope_id', 'setor_id', 'criado_em']);
    }

    // Mutator para garantir que o status seja tratado como booleano
    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = (bool) $value;
    }

    // Accessor para garantir que o status seja legível
    public function getStatusLabelAttribute()
    {
        return $this->status ? 'Ativo' : 'Inativo';
    }
}
