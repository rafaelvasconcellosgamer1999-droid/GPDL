<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CargoSetorScope extends Model
{
    protected $table = 'cargo_setor_scope';

    protected $fillable = [
        'cargo_id',
        'setor_id',
        'scope_id', // Referência à tabela 'scopes'
    ];

    public function cargo()
    {
        return $this->belongsTo(Cargo::class);
    }

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }

    public function scope()
    {
        return $this->belongsTo(Scope::class);
    }
}
