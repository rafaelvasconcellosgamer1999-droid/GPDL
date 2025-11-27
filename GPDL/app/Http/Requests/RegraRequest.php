<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegraRequest extends FormRequest
{
    public function authorize(): bool
    {
        // 🔒 Caso futuramente queira limitar por permissões, pode ajustar aqui
        return true;
    }

    public function rules(): array
    {
        // 🔹 Filtros de GET (ex: ?cargo_id=)
        if ($this->isMethod('get')) {
            return [
                'cargo_id' => ['nullable', 'exists:cargos,id'],
            ];
        }

        // 🔹 Regras gerais de criação/edição
        $rules = [
            'cargo_id'     => ['required', 'exists:cargos,id'],
            'permissao_id' => ['required', 'exists:permissoes,id'],
            'scope_id'     => ['required', 'exists:scopes,id'], // agora é obrigatório na pivot
            'setor_id'     => ['nullable', 'exists:setores,id'],
        ];

        // 🔹 Impede duplicidade (cargo_id + permissao_id + scope_id + setor_id)
        $uniqueRule = Rule::unique('cargo_permissoes', 'permissao_id')
            ->where(function ($query) {
                $query->where('cargo_id', $this->cargo_id)
                      ->where('scope_id', $this->scope_id);

                // setor_id pode ser NULL
                if ($this->setor_id) {
                    $query->where('setor_id', $this->setor_id);
                } else {
                    $query->whereNull('setor_id');
                }
            });

        // 🔹 Aplica conforme o método HTTP
        if ($this->isMethod('post')) {
            $rules['permissao_id'][] = $uniqueRule;
        } elseif ($this->isMethod('put') || $this->isMethod('patch') || $this->is('admin/regras/atualizar')) {
            $rules['permissao_id'][] = $uniqueRule->ignore($this->id);
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'cargo_id.required'     => 'O campo Cargo é obrigatório.',
            'permissao_id.required' => 'O campo Permissão é obrigatório.',
            'permissao_id.unique'   => 'Já existe uma regra com essa combinação de Cargo, Permissão, Escopo e Setor.',
            'scope_id.required'     => 'O campo Escopo é obrigatório.',
        ];
    }

    protected function failedValidation(Validator $validator)
{
    throw new HttpResponseException(
        response()->json([
            'message' => 'Os dados enviados são inválidos.',
            'errors'  => $validator->errors(),
        ], 422)
    );
}

    protected function prepareForValidation(): void
    {
        $this->merge([
            'cargo_id'     => $this->cargo_id ? (int) $this->cargo_id : null,
            'permissao_id' => $this->permissao_id ? (int) $this->permissao_id : null,
            'scope_id'     => $this->scope_id ? (int) $this->scope_id : null,
            'setor_id'     => $this->setor_id ? (int) $this->setor_id : null,
        ]);
    }
}
