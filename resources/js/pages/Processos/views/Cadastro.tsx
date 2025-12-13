// resources/js/Pages/Processos/views/Cadastro.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Layers } from 'lucide-react';
import CadastroIndividual from '../CadastroIndividual';

export type OptionItem = { id: string | number; nome: string };
export type Procurador = { id: number; nome: string };
export type CadastroViewProps = {
  setorSelecionado?: string;
  procuradores?: Procurador[];
  tribunais?: OptionItem[];
  acoes?: OptionItem[];
  orgaos?: OptionItem[];
  orgaosJulgadores?: OptionItem[];
};
export default function CadastroView(props: CadastroViewProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-(--gpdl-border) bg-(--surface-card) p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-(--text-strong)">Central de cadastros</h2>
            <p className="text-sm text-(--text-muted)">
              Aqui você encontra as opções para criar um novo processo:
              cadastro individual (passo-a-passo) ou importar em lote.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/processos/cadastro"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5
               bg-indigo-600 hover:bg-indigo-700 text-white font-medium
               shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Cadastro individual
            </Link>

            <Link
              href="/processos/import"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5
               bg-(--surface-card) hover:bg-(--surface-muted)
               text-(--text-strong) border border-(--gpdl-border)
               shadow-sm hover:shadow-md transition-all"
            >
              <Layers className="h-4 w-4" />
              Cadastro em lote
            </Link>

            <Link
              href="/andamentos/cadastro"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5
               bg-emerald-600 hover:bg-emerald-700 text-white font-medium
               shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Cadastro de andamento
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="gpdl-card p-4">
            <h3 className="font-semibold text-(--text-strong)">Cadastro individual</h3>
            <p className="mt-1 text-sm text-(--text-muted)">
              Use o formulário passo-a-passo para preencher todos os dados do processo,
              partes e distribuição ao final.
            </p>
          </div>

          <div className="gpdl-card p-4">
            <h3 className="font-semibold text-(--text-strong)">Cadastro em lote</h3>
            <p className="mt-1 text-sm text-(--text-muted)">
              Cole publicações em lote (PJE) e o sistema tentará extrair campos automaticamente.
            </p>
          </div>
          
          <div className="gpdl-card p-4">
            <h3 className="font-semibold text-(--text-strong)">Cadastro de andamento</h3>
            <p className="mt-1 text-sm text-(--text-muted)">
              Registre movimentações, prazos, responsáveis e status
              vinculados a um processo já cadastrado.
            </p>
          </div>

          <div className="gpdl-card p-4">
            <h3 className="font-semibold text-(--text-strong)">Ajuda rápida</h3>
            <p className="mt-1 text-sm text-(--text-muted)">
              Dica: para cadastro individual, preencha a primeira etapa com dados do processo.
              A distribuição e responsável são definidos na última etapa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  return <CadastroIndividual {...props} />;
}
