<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegraRequest extends FormRequest
{
    /**
     * Autoriza a requisição
     */
    public function authorize(): bool
    {
        // 🔒 Se houver controle de acesso no futuro, pode trocar por verificação de permissionamento
        return true;
    }

    /**
     * Regras de validação
     */
    public function rules(): array
    {
        // 🔹 Validação simples em GET (filtros)
        if ($this->isMethod('get')) {
            return [
                'cargo_id' => ['nullable', 'exists:cargos,id'],
            ];
        }

        // 🔹 Regras para criação/atualização
        $rules = [
            'cargo_id' => ['required', 'exists:cargos,id'],
            'permissao_id' => ['required', 'exists:permissoes,id'],
            'scope_id' => ['nullable', 'exists:scopes,id'],
            'setor_id' => ['nullable', 'exists:setores,id'],
        ];

        // 🔹 Impede duplicidade (cargo + permissão + scope + setor)
        if ($this->isMethod('post')) {
            $rules['permissao_id'][] = Rule::unique('cargo_permissoes_scoped')->where(function ($query) {
                return $query
                    ->where('cargo_id', $this->cargo_id)
                    ->where('permissao_id', $this->permissao_id)
                    ->where('scope_id', $this->scope_id ?: null)
                    ->where('setor_id', $this->setor_id ?: null);
            });
        }

        // 🔹 Em atualização, ignora a própria linha
        if ($this->isMethod('put') || $this->isMethod('patch') || $this->is('admin/regras/atualizar')) {
            $rules['permissao_id'][] = Rule::unique('cargo_permissoes_scoped')->where(function ($query) {
                return $query
                    ->where('cargo_id', $this->cargo_id)
                    ->where('permissao_id', $this->permissao_id)
                    ->where('scope_id', $this->scope_id ?: null)
                    ->where('setor_id', $this->setor_id ?: null);
            })->ignore($this->id);
        }

        return $rules;
    }

    /**
     * Mensagens de erro personalizadas
     */
    public function messages(): array
    {
        return [
            'cargo_id.required' => 'O campo Cargo é obrigatório.',
            'cargo_id.exists' => 'O cargo selecionado é inválido.',
            'permissao_id.required' => 'O campo Permissão é obrigatório.',
            'permissao_id.exists' => 'A permissão selecionada é inválida.',
            'permissao_id.unique' => 'Já existe uma regra com essa combinação de Cargo, Permissão, Escopo e Setor.',
            'scope_id.exists' => 'O escopo selecionado é inválido.',
            'setor_id.exists' => 'O setor selecionado é inválido.',
        ];
    }

    /**
     * Normaliza dados antes da validação (garante consistência nos tipos)
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'cargo_id' => $this->cargo_id ? (int) $this->cargo_id : null,
            'permissao_id' => $this->permissao_id ? (int) $this->permissao_id : null,
            'scope_id' => $this->scope_id ? (int) $this->scope_id : null,
            'setor_id' => $this->setor_id ? (int) $this->setor_id : null,
        ]);
    }
}
