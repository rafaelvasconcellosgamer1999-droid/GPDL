<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsuarioRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Sempre autorizado
    }

    public function rules()
    {
        $rules = [];

        if ($this->isMethod('get')) {
            // 🔹 Filtros opcionais para listagem (sem redirecionar se faltar)
            $rules['cargo_id'] = 'nullable|integer|exists:cargos,id';
            $rules['setor_id'] = 'nullable|integer|exists:setores,id';
            $rules['status'] = 'nullable|in:ativos,inativos,todos';
        }

        if ($this->isMethod('post')) {
            // 🔹 Regras genéricas para ações via POST (habilitar, desabilitar, etc.)
            $rules['id'] = 'required|integer|exists:usuarios,id';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'cargo_id.exists' => 'O cargo selecionado não existe.',
            'setor_id.exists' => 'O setor selecionado não existe.',
            'status.in' => 'O status informado é inválido.',
            'id.required' => 'O identificador do usuário é obrigatório.',
            'id.exists' => 'Usuário não encontrado.',
        ];
    }
}
