<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setor extends Model
{
    protected $table = 'setores';

    protected $fillable = [
        'nome',
        'sigla',
        'ativo'
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    // Relationships
    public function usuarios()
    {
        return $this->hasMany(User::class, 'setor_id');
    }

    // Scopes
    public function scopeAtivos($query)
    {
        return $query->where('ativo', 1);
    }
}