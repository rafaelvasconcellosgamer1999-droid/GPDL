<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Solicitacao extends Model
{
    protected $table = 'solicitacoes';

    const CREATED_AT = 'data_solicitacao';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome',
        'usuarioRede',
        'email',
        'setor',
        'cargo_id'
    ];

    protected $casts = [
        'data_solicitacao' => 'datetime',
    ];

    // Relationship
    public function cargo()
    {
        return $this->belongsTo(Cargo::class);
    }
}