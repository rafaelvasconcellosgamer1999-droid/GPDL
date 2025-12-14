<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsuarioRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        // 1. Regras para Listagem (GET)
        if ($this->isMethod('get')) {
            return [
                'cargo_id' => 'nullable|integer|exists:cargos,id',
                'setor_id' => 'nullable|integer|exists:setores,id',
                'status'   => 'nullable|in:ativos,inativos,todos',
            ];
        }

        // 2. Regras Comuns para Ações (POST/PUT/PATCH)
        // Todas as ações de escrita exigem o ID do usuário
        $rules = [
            'id' => 'required|integer|exists:usuarios,id',
        ];

        // 3. Regras Específicas para "Atualizar"
        // Se a requisição contiver 'cargo_id', entendemos que é uma atualização completa
        if ($this->has('cargo_id')) {
            $rules['cargo_id'] = 'required|integer|exists:cargos,id';
            $rules['setor_id'] = 'nullable|integer|exists:setores,id';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'cargo_id.exists' => 'O cargo selecionado não existe.',
            'cargo_id.required' => 'O campo cargo é obrigatório na atualização.',
            'setor_id.exists' => 'O setor selecionado não existe.',
            'status.in' => 'O status informado é inválido.',
            'id.required' => 'O identificador do usuário é obrigatório.',
            'id.exists' => 'Usuário não encontrado.',
        ];
    }
}