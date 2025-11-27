<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CargoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Aqui você pode limitar por permissão futuramente, se quiser
        return true;
    }

    public function rules(): array
    {
        $id = $this->id ?? null; // usado para ignorar o ID atual na validação de unique

        return [
            'id'     => 'nullable|exists:cargos,id',
            'nome'   => 'required|string|max:50|unique:cargos,nome,' . $id,
            'status' => 'nullable|in:0,1', // Garantir que status seja 0 ou 1 (ativo ou inativo)
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do cargo é obrigatório.',
            'nome.unique'   => 'Já existe um cargo com este nome.',
            'nome.max'      => 'O nome pode ter no máximo 50 caracteres.',
            'id.exists'     => 'O cargo selecionado não foi encontrado.',
            'status.in'     => 'O status do cargo deve ser 0 (inativo) ou 1 (ativo).',
        ];
    }
}
