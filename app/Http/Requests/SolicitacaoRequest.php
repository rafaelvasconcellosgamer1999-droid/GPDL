<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitacaoRequest extends FormRequest
{
    /**
     * Como é uma tela de login pública, qualquer um pode solicitar.
     */
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nome' => 'required|string|max:100',
            // Regra unique evita duplicidade na tabela 'solicitacoes'
            'usuarioRede' => 'required|string|max:80|unique:solicitacoes,usuarioRede', 
            'email' => 'required|string|email|max:150|unique:solicitacoes,email',
            'setor' => 'nullable|string|max:120',
        ];
    }

    public function messages()
    {
        return [
            'nome.required' => 'Por favor, informe seu nome completo.',
            'usuarioRede.required' => 'O usuário de rede é obrigatório.',
            'usuarioRede.unique' => 'Já existe uma solicitação pendente para este usuário.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Informe um endereço de e-mail válido.',
            'email.unique' => 'Já existe uma solicitação pendente para este e-mail.',
        ];
    }
}