// resources/js/Pages/Processos/CadastroLote.tsx
import React from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';

type Procurador = { id: number; nome: string };

export default function CadastroLote({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    modelo: 'pje',
    responsavel_id: '',
    assunto: '',
    texto: '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/processos/importar-lote', { preserveScroll: true, onSuccess: () => reset('assunto', 'texto') });
  }

  return (
    <GPDLLayout breadcrumbs={[ { title: 'Processos', href: '/processos' },
  { title: 'Cadastro em lote', href: '' },]}>
      <Head title="Processos - Cadastro em lote" />
      <div className="mt-4 rounded-lg bg-(--surface-card) p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-(--text-strong)">Cadastro em lote</h2>
          <Link href="/processos" className="gpdl-link">Voltar à lista</Link>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-(--text-muted)">Responsável</label>
              <select value={data.responsavel_id} onChange={e => setData('responsavel_id', e.target.value)} className="gpdl-input-contrast px-3 py-2">
                <option value="">Selecione um procurador</option>
                {procuradores.map(p => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
              </select>
              <InputError message={errors.responsavel_id} className="mt-1" />
            </div>

            <div>
              <label className="mb-1 block text-xs text-(--text-muted)">Modelo</label>
              <select value={data.modelo} onChange={e => setData('modelo', e.target.value)} className="gpdl-input-contrast px-3 py-2">
                <option value="pje">PJE</option>
              </select>
              <InputError message={errors.modelo} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-(--text-muted)">Cole o texto completo do processo</label>
            <textarea value={data.texto} onChange={e => setData('texto', e.target.value)} rows={12} className="gpdl-input-contrast px-3 py-2" placeholder="Separe processos por uma linha em branco" />
            <InputError message={errors.texto} className="mt-1" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-lg bg-(--brand-700) px-4 py-2 text-white hover:bg-(--brand-600) disabled:opacity-50">
              {processing ? 'Importando...' : 'Adicionar processo(s)'}
            </button>
            <button type="button" onClick={() => reset()} className="flex items-center gap-2 rounded-lg bg-(--surface-muted) px-4 py-2">Limpar campos</button>
          </div>
        </form>
      </div>
    </GPDLLayout>
  );
}
