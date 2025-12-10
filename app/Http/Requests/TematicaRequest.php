<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TematicaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ajuste se quiser permissões
    }

    public function rules(): array
    {
        return [
            'id'   => 'nullable|integer|exists:tematicas,id',
            'nome' => 'required|string|max:255',
            'tipo' => 'nullable|string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da temática é obrigatório.',
            'nome.string'   => 'O nome deve ser um texto válido.',
            'nome.max'      => 'O nome não pode ultrapassar 255 caracteres.',

            'tipo.string'   => 'O tipo deve ser um texto válido.',
            'tipo.max'      => 'O tipo não pode ultrapassar 100 caracteres.',

            'id.exists'     => 'A temática selecionada não existe.',
        ];
    }
}
