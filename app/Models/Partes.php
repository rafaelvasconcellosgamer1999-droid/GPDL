<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partes extends Model
{
    protected $table = 'partes';
    protected  $fillable = [
        'processo_id',
        'nome',
        'qualificacao',
        'tipo_qualificacao',
        'parte_principal',

    ];

    public function processoRef(){
        return $this->belongsTo(Processos::class, 'processo_id');
    }
}
