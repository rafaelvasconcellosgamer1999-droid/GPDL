<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // ✅ Diferencia GET e POST
        if ($this->isMethod('get')) {
            return [];
        }

        // ✅ Validação genérica para criação/edição/toggle
        return match ($this->route()->getActionMethod()) {
            'criarSetor' => [
                'nome' => 'required|string|max:100|unique:setores,nome',
                'sigla' => 'nullable|string|max:20|unique:setores,sigla',
            ],
            'editarSetor' => [
                'id' => 'required|exists:setores,id',
                'nome' => 'required|string|max:100',
                'sigla' => 'nullable|string|max:20',
            ],
            'toggleSetor' => [
                'id' => 'required|exists:setores,id',
            ],
            default => [],
        };
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do setor é obrigatório.',
            'nome.unique' => 'Já existe um setor com esse nome.',
            'sigla.unique' => 'Essa sigla já está sendo usada.',
            'id.exists' => 'O setor selecionado não foi encontrado.',
        ];
    }
}
