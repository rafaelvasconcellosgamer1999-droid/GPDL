<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntidadesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ajuste se tiver ACL
    }

    public function rules(): array
    {
        return [
            'id'    => 'nullable|integer|exists:entidades_juridicas,id',
            'sigla' => 'required|string|max:50',
            'nome'  => 'nullable|string|max:255',
            'tipo'  => 'nullable|string|max:100',
            'status'=> 'nullable|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'sigla.required' => 'A sigla é obrigatória.',
            'sigla.string'   => 'A sigla deve ser um texto válido.',
            'sigla.max'      => 'A sigla não pode ultrapassar 50 caracteres.',

            'nome.string'    => 'O nome deve ser um texto válido.',
            'nome.max'       => 'O nome não pode ultrapassar 255 caracteres.',

            'tipo.string'    => 'O tipo deve ser um texto válido.',
            'tipo.max'       => 'O tipo não pode ultrapassar 100 caracteres.',

            'status.in'      => 'Status inválido. Utilize apenas 0 (inativo) ou 1 (ativo).',

            'id.exists'      => 'A entidade jurídica selecionada não existe.',
        ];
    }
}
