<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntidadesJuridicas extends Model
{
    protected $table = 'entidades_juridicas';
    protected $fillable = [
        'nome',
        'tipo',
        'sigla',
        'status',
    ];

    public function tribunal(){
        return $this->hasMany(Processos::class,'tribunal_id');

    }
    public function entidadeOrigem(){
        return $this->hasMany(Processos::class, 'orgao_origem_id');
    }
    public function entidadeJulgadora(){
        return $this->hasMany(Processos::class, 'orgao_julgador_id');

    }
}
