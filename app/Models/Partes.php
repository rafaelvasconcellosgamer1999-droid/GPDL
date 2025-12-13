<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partes extends Model
{
    protected $table = 'partes';
    protected  $fillable = [
        'processo_id',
        'nome',
        'cpf_cnpj',
        'tipo_parte', 

    ];

   public function processos()
{
    return $this->belongsToMany(Processos::class, 'parte_processo', 'parte_id', 'processo_id')
        ->using(Parte_Processo::class) 
        ->withPivot([
            'qualificacao', 
            'tipo_qualificacao', 
            'parte_principal'
        ])
        ->withTimestamps();
}
}
