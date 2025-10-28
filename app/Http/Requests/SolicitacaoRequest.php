<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitacaoRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Se você tiver alguma lógica de autorização personalizada, pode alterar aqui.
    }

    public function rules()
    {
        return [
            'id' => 'required|exists:solicitacoes,id',
            'cargo_id' => 'required|exists:cargos,id',
            'setor_id' => 'required|exists:setores,id',
            'senha' => 'required|string|min:6', // Requer uma senha de pelo menos 6 caracteres
        ];
    }
}
