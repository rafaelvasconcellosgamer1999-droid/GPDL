<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot; 

class Parte_Processo extends Pivot 
{
    protected $table = 'parte_processo';
    public $incrementing = true; 

    protected $fillable = [
        'processo_id',
        'parte_id',
        'qualificacao',      
        'tipo_qualificacao', 
        'parte_principal',   
    ];

    public function processo(){
        return $this->belongsTo(Processos::class, 'processo_id');
    }

    public function parte(){
        return $this->belongsTo(Partes::class, 'parte_id');
    }
}