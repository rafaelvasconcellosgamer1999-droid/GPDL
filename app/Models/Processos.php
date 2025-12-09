<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Processos extends Model
{
    protected $table = 'processos2';

    protected $fillable = [,
        'area_atuacao',
        'tipo_processo', //pje, fedral, fazenda
        'cnj',
        'processo_ref_id', //processo pai
        'municipio',
        'tribunal_id', //entidade_juridica_id
        'acao_id', //tematica_id
        'assunto_id', //tematica_id
        'instancia',
        'orgao_origem_id', //entidade_juridica_id
        'orgao_julgador_id', //entidade_juridica_id
        'valor_causa',
        'tipo_pagamento', //precatorio / rpv
        'numero_agravo',
        'numero_suspensao',
        'numero_protocolo',
        'tipo_distribuição',
        'motivo_distribuição',
        'usuario_cadastro_id', //quem cadastrou
        'procurador_responsavel_id', //user_id where cargo == procurador
        'status', //finalizado, em andamento...
        'prazo',

    ];

    public function processoRef(){
        return $this->belongsTo(Processos::class, 'processo_ref_id');
    }

    public function ramificacoes(){
        return $this->hasMany(Processos::class, 'processo_ref_id');
    }

    public function acao(){
        return $this->belongsTo(Tematicas::class, 'acao_id');
    }

     public function assunto(){
        return $this->belongsTo(Tematicas::class, 'assunto_id');
    }
    public function tribunal(){
        return $this->belongsTo(EntidadesJuridicas::class, 'tribunal_id');
    }
    public function entidadeOrigem(){
        return $this->belongsTo(EntidadesJuridicas::class, 'orgao_origem_id');
    }
      public function entidadeJulgadora(){
        return $this->belongsTo(EntidadesJuridicas::class, 'orgao_julgador_id');
    }
    public function partes(){
        return $this->hasMany(Partes::class);
    }
    public function cadastradoPor() {
        return $this->belongsTo(User::class, 'usuario_cadastro_id');
    }
    
    public function procuradorResponsavel() {
        return $this->belongsTo(User::class, 'procurador_responsavel_id');
    }

}
