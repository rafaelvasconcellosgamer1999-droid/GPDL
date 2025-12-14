import React from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AutocompleteSearch from '@/components/autocomplete-search';
import { Check, ArrowLeft, User, Flag } from 'lucide-react';
import axios from 'axios';

// --- Tipos ---
type OptionItem = {
  id: string | number;
  nome: string;
};
type ProcessoOption = {
  id: number | string;
  nome: string;
  procurador_responsavel_id?: number | string | null;
  procurador_responsavel_nome?: string;
};

type FormShape = {
  processo_id: string;
  descricao: string;
  tipo_andamento: string;
  tipo_movimentacao: string;
  data_prazo: string;
  data_ciencia: string;
  status: string;
  procurador_andamento_id: string;
  assessor_andamento_id: string;
};

// --- Constantes ---
const INPUT_BASE = 'gpdl-input-contrast w-full px-3 py-2 text-sm rounded-lg border-0 ring-1 ring-[var(--gpdl-border)] focus:ring-2 focus:ring-[var(--brand-500)]';
const LABEL = 'block text-xs font-bold uppercase tracking-wide mb-1 opacity-70';
const TIPOS_ANDAMENTO = [
  { id: 'despacho', nome: 'Despacho' },
  { id: 'decisao', nome: 'Decisão' },
  { id: 'sentenca', nome: 'Sentença' },
];

const TIPOS_MOVIMENTACAO = [
  { id: 'entrada', nome: 'Entrada' },
  { id: 'saida', nome: 'Saída' },
  { id: 'prazo', nome: 'Prazo' },
];

export default function CadastroAndamento({
  procuradores = [],
  assessores = [],
}: {
  processos: OptionItem[];
  procuradores: OptionItem[];
  assessores: OptionItem[];
}) {
  const { data, setData, post, processing, errors } = useForm<FormShape>({
    processo_id: '',
    descricao: '',
    tipo_andamento: '',
    tipo_movimentacao: '',
    data_prazo: '',
    data_ciencia: '',
    status: 'aberto',
    procurador_andamento_id: '',
    assessor_andamento_id: '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/andamentos');
  }
  return (
    <GPDLLayout breadcrumbs={[
      { title: 'Processos', href: '/processos' },
      { title: 'Andamentos', href: '/andamentos' },
      { title: 'Cadastro', href: '/andamentos/cadastro' },
    ]}>
      <Head title="Cadastrar Andamento" />

      <div className="mt-4 w-full px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-strong)' }}>Cadastrar andamento</h1>
          <Link href="/andamentos" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-card)' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>

        <form onSubmit={submit} className="gpdl-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12">
              <label className={LABEL}>Processo</label>
              <AutocompleteSearch<ProcessoOption>
                placeholder="Buscar processo pelo número..."
                value={data.processo_id}
                onChange={(v) => setData('processo_id', String(v))}
                onSelectOption={(processo) => {
                  if (!processo) return;

                  setData('processo_id', String(processo.id));

                  if (processo.procurador_responsavel_id) {
                    setData(
                      'procurador_andamento_id',
                      String(processo.procurador_responsavel_id)
                    );
                  }
                }}
                onSearch={async (q) => {
                  if (!q || q.length < 3) return [];

                  const res = await axios.get('/processos/buscar', {
                    params: { q },
                  });

                  return res.data as ProcessoOption[];
                }}
                options={[]}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Descrição do andamento</label>
            <textarea
              className={`${INPUT_BASE} min-h-[120px]`}
              value={data.descricao}
              onChange={(e) => setData('descricao', e.target.value)}
              placeholder="Descreva o andamento processual"
            />
            <InputError message={errors.descricao} className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Tipo de andamento</label>
              <AutocompleteSearch
                placeholder="Selecionar tipo de andamento"
                value={data.tipo_andamento}
                onChange={(v) => setData('tipo_andamento', String(v))}
                options={TIPOS_ANDAMENTO}
                onSearch={async (q) =>
                  TIPOS_ANDAMENTO.filter(t =>
                    t.nome.toLowerCase().includes(q.toLowerCase())
                  )
                }
              />
            </div>
            <div>
              <label className={LABEL}>Tipo de movimentação</label>
              <AutocompleteSearch
                placeholder="Selecionar tipo de movimentação"
                value={data.tipo_movimentacao}
                onChange={(v) => setData('tipo_movimentacao', String(v))}
                options={TIPOS_MOVIMENTACAO}
                onSearch={async (q) =>
                  TIPOS_MOVIMENTACAO.filter(t =>
                    t.nome.toLowerCase().includes(q.toLowerCase())
                  )
                }
              />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select className={INPUT_BASE} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                <option value="aberto">Aberto</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}><Flag className="inline h-3 w-3" /> Data do prazo</label>
              <input type="date" className={INPUT_BASE} value={data.data_prazo} onChange={(e) => setData('data_prazo', e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Data da ciência</label>
              <input type="date" className={INPUT_BASE} value={data.data_ciencia} onChange={(e) => setData('data_ciencia', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}><User className="inline h-3 w-3" /> Procurador responsável</label>
              <AutocompleteSearch
                placeholder="Selecione um procurador"
                value={data.procurador_andamento_id}
                onChange={(val) => setData('procurador_andamento_id', String(val))}
                onSearch={async (q) => {
                  return procuradores
                    .filter(p => p.nome.toLowerCase().includes(q.toLowerCase()))
                    .map(p => ({
                      id: String(p.id),
                      nome: p.nome,
                    }));
                }}
                options={procuradores.map(p => ({
                  id: String(p.id),
                  nome: p.nome,
                }))}
              />
            </div>
            <div>
              <label className={LABEL}><User className="inline h-3 w-3" /> Assessor responsável</label>
              <AutocompleteSearch
                placeholder="Selecione um assessor"
                value={data.assessor_andamento_id}
                onChange={(val) => setData('assessor_andamento_id', String(val))}
                onSearch={async (q) => {
                  return assessores
                    .filter(a => a.nome.toLowerCase().includes(q.toLowerCase()))
                    .map(a => ({
                      id: String(a.id),
                      nome: a.nome,
                    }));
                }}
                options={assessores.map(a => ({
                  id: String(a.id),
                  nome: a.nome,
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
            <button type="submit" disabled={processing} className="btn-gradient rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-md">
              {processing ? 'Salvando...' : 'Salvar andamento'} <Check className="inline h-4 w-4 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </GPDLLayout>
  );
}
