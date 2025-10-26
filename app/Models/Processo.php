<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Processo extends Model
{
    protected $table = 'processos';

    protected $fillable = [
        'processo_pai_id',
        'orgao',
        'acao',
        'numero',
        'assunto',
        'partes_envolvidas',
        'vara_juizo',
        'procurador_responsavel_id',
        'usuario_cadastro_id',
        'data_entrada',
        'data_ciencia',
        'ultimo_mov_texto',
        'ultimo_mov_data',
        'data_limite',
        'data_finalizacao',
        'status',
        'origem_cadastro',
        'setor_id',
    ];

    protected $casts = [
        'data_entrada' => 'datetime',
        'data_ciencia' => 'datetime',
        'ultimo_mov_data' => 'datetime',
        'data_limite' => 'date',
        'data_finalizacao' => 'datetime',
    ];

    // Relacionamentos
    public function responsavel()
    {
        return $this->belongsTo(User::class, 'procurador_responsavel_id');
    }

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }
}
