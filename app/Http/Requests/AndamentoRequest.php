<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AndamentoRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Ajuste se precisar de permissões específicas
    }

    public function rules()
    {
        $rules = [
            'descricao' => 'required|string|max:5000',
            'tipo_andamento' => 'required|string|max:255',
            'tipo_movimentacao' => 'required|string|max:255',
            'data_andamento' => 'required|date', // Padronizei como required nos dois casos
            'data_prazo' => 'nullable|date|after_or_equal:data_andamento',
            'data_ciencia' => 'required|date',
            'status' => 'required|in:aberto,concluido,cancelado',
            'procurador_andamento_id' => 'required|exists:usuarios,id',
            'assessor_andamento_id' => 'nullable|exists:usuarios,id',
        ];

        // Se for criação (POST), exige o ID do processo.
        // Se for edição (PUT/PATCH), geralmente não se muda o processo pai.
        if ($this->isMethod('post')) {
            $rules['processo_id'] = 'required|exists:processos2,id';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'processo_id.required' => 'O vínculo com um processo é obrigatório.',
            'processo_id.exists' => 'O processo informado não existe.',
            'data_prazo.after_or_equal' => 'A data do prazo não pode ser anterior à data do andamento.',
            'status.in' => 'O status deve ser: aberto, concluido ou cancelado.',
        ];
    }
    
    /**
     * Prepara os dados antes da validação (opcional)
     * Útil se quiser garantir que 'data_andamento' tenha valor default se vier vazio no POST
     */
    protected function prepareForValidation()
    {
        if ($this->isMethod('post') && !$this->data_andamento) {
            $this->merge([
                'data_andamento' => now()->format('Y-m-d'),
            ]);
        }
    }
}