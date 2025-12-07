<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tematicas extends Model
{
    protected $table = 'tematicas';
    protected $fillable = [
        'nome',
        'tipo', // ação ou assunto
    ];

    public function acaoProcesso(){
        return $this->hasMany(Processos::class, 'acao_id');
    }

    public function assuntoProcesso(){
        return $this->hasMany(Processos::class, 'assunto_id');
    }
}
