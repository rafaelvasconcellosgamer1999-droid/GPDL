<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Andamento extends Model
{
    protected $table = 'andamentos';
    protected $fillable = [
        'processo_id',
        'descricao',
        'procurador_andamento_id',
        'assessor_andamento_id',
        'tipo_andamento',
        'tipo_movimentacao',
        'data_prazo',
        'data_andamento',
        'data_ciencia',
        'status',
        'usuario_cadastro_id',
    ];

    public function processo(){
        return $this->belongsTo(Processos::class, 'processo_id');
    }
    public function procuradorAndamento(){
        return $this->belongsTo(User::class, 'procurador_andamento_id');
    }
    public function assessorAndamento(){
        return $this->belongsTo(User::class, 'assessor_andamento_id');
    }
    public function cadastradoPor(){
        return $this->belongsTo(User::class, 'usuario_cadastro_id');
    }
}
