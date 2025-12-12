<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProcessoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'cnj' => $this->cnj,
            'tipo_processo' => $this->tipo_processo,
            'municipio' => $this->municipio,
            'tribunal' => $this->when($this->tribunal, fn() => [
                'id' => $this->tribunal->id,
                'nome' => $this->tribunal->nome,
            ]),
            'acao' => $this->when($this->acao, fn() => [
                'id' => $this->acao->id,
                'nome' => $this->acao->nome,
            ]),
            'assunto' => $this->when($this->assunto, fn() => [
                'id' => $this->assunto->id,
                'nome' => $this->assunto->nome,
            ]),
            'instancia' => $this->instancia,
            'procurador_responsavel' => $this->when($this->procuradorResponsavel, fn() => [
                'id' => $this->procuradorResponsavel->id,
                'name' => $this->procuradorResponsavel->nome ?? $this->procuradorResponsavel->name ?? null,
            ]),
            'status' => $this->status ?? null,
            'prazo' => $this->prazo ? (string) $this->prazo : null,
            'data_limite' => $this->data_limite ? (string) $this->data_limite : null,
            'andamentos_count' => $this->when(isset($this->andamentos_count), $this->andamentos_count, $this->andamentos ? $this->andamentos->count() : 0),
            'incidencias_count' => $this->when(isset($this->incidencias_count), $this->incidencias_count, $this->incidencias ? $this->incidencias->count() : 0),
            'andamentos' => $this->whenLoaded('andamentos', fn() => $this->andamentos->map(fn($a) => [
                'id' => $a->id,
                'titulo' => $a->titulo ?? null,
                'data' => isset($a->data) ? (string)$a->data : null,
                'descricao' => $a->descricao ?? null,
            ])),
            'incidencias' => $this->whenLoaded('incidencias', fn() => $this->incidencias->map(fn($i) => [
                'id' => $i->id,
                'tipo' => $i->tipo ?? null,
                'data' => isset($i->data) ? (string)$i->data : null,
                'descricao' => $i->descricao ?? null,
            ])),
        ];
    }
}
