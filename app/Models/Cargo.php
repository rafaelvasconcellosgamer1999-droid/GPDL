<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    protected $table = 'cargos';

    protected $fillable = [
        'nome'
    ];

    // Relationships
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
}