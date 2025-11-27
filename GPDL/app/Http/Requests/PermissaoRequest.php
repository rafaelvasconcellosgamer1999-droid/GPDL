<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PermissaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Caso futuramente queira limitar quem pode usar, pode usar políticas aqui
        return true;
    }

    public function rules(): array
{
    $id = $this->id ?? null;

    return [
        'chave'     => 'required|string|max:60|unique:permissoes,chave,' . $id,
        'nome'      => 'required|string|max:60|unique:permissoes,nome,' . $id,
        'descricao' => 'nullable|string|max:120',
    ];
}

public function messages(): array
{
    return [
        'chave.required' => 'O campo chave é obrigatório.',
        'chave.unique'   => 'Já existe uma permissão com esta chave.',
        'chave.max'      => 'A chave pode ter no máximo 60 caracteres.',
        'nome.required'  => 'O campo nome é obrigatório.',
        'nome.unique'    => 'Já existe uma permissão com este nome.',
        'nome.max'       => 'O nome pode ter no máximo 60 caracteres.',
        'descricao.max'  => 'A descrição pode ter no máximo 120 caracteres.',
    ];
}
}
