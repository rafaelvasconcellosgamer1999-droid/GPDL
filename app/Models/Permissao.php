<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permissao extends Model
{
    protected $table = 'permissoes';

    public $timestamps = false;

    protected $fillable = [
        'nome',      // Descrição humanizada (ex: "Editar Processos")
        'descricao',
        'chave',     // Slug técnico (ex: "processos.editar") – adicione coluna na migration se necessário
    ];

    /*
     * Relacionamento com cargos.
     * Usa a nova pivot `cargo_permissoes` e inclui o `setor_id` como coluna extra.
     */
    public function cargos()
    {
        return $this->belongsToMany(
            Cargo::class,
            'cargo_permissoes',   // novo nome da pivot
            'permissao_id',
            'cargo_id'
        )->withPivot('setor_id');
    }
}
