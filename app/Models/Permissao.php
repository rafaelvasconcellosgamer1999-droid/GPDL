<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permissao extends Model
{
    protected $table = 'permissoes';
    
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'descricao'
    ];

    // Relationships
    public function cargos()
    {
        return $this->belongsToMany(
            Cargo::class,
            'cargo_permissoes_scoped',
            'permissao_id',
            'cargo_id'
        );
    }
}