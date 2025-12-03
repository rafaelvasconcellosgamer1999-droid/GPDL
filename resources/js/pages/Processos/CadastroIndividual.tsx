// resources/js/Pages/Processos/CadastroIndividual.tsx
import React from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';

type Procurador = { id: number; nome: string };

export default function CadastroIndividual({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    responsavel_id: '',
    setor: '',
    instancia: '',
    tribunal: '',
    valor_causa: '',
    numero_processo: '',
    tipo_processo: '',
    is_precatorio: '',
    acao: '',
    assunto: '',
    orgao_origem: '',
    orgao_julgador: '',
    juizo_vara: '',
    numero_juizo_vara: '',
    numero_agravo: '',
    numero_suspensao: '',
    numero_protocolo: '',
    ano: '',
    data_limite: '',
  });

  function submit(e: React.FormEvent) {
  e.preventDefault();

  const normalized = data.is_precatorio === 'precatorio' ? 1 : 0;

  // converte para string porque o form espera string
  setData('is_precatorio', String(normalized));

  post('/processos', {
    preserveScroll: true,
    onSuccess: () => reset(),
  });
}

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Processos', href: '/processos' }, { title: 'Cadastro individual', href: '' }]}>
      <Head title="Processos - Cadastro individual" />

      <div className="mt-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Cadastro individual</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Preencha os detalhes do processo. Campos opcionais estão marcados.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/processos" className="rounded-lg border px-3 py-2 bg-[var(--surface-muted)] text-sm hover:border-[var(--brand-600)]/40">Voltar</Link>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">

          {/* --------------------- Dados básicos --------------------- */}
          <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-strong)]">Dados básicos</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Informações gerais do processo e responsável.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Responsável</label>
                <select value={String(data.responsavel_id)} onChange={(e) => setData('responsavel_id', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2">
                  <option value="">Selecione um procurador</option>
                  {procuradores.map(p => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
                </select>
                <InputError message={errors.responsavel_id} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Setor de atuação <span className="text-[var(--text-muted)] text-xs">(opcional)</span></label>
                <input value={data.setor} onChange={(e) => setData('setor', e.target.value)} placeholder="Ex.: Contencioso / Precatórios" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.setor} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Instância <span className="text-[var(--text-muted)] text-xs">(opcional)</span></label>
                <input value={data.instancia} onChange={(e) => setData('instancia', e.target.value)} placeholder="1ª / 2ª / STJ / STF" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.instancia} className="mt-1" />
              </div>
            </div>
          </section>

          {/* --------------------- Processo / Valores --------------------- */}
          <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-strong)]">Processo e valores</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Dados identificadores e financeiros.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Tribunal</label>
                <input value={data.tribunal} onChange={(e) => setData('tribunal', e.target.value)} placeholder="Ex.: TJPA" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.tribunal} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Valor da causa (R$)</label>
                <input value={data.valor_causa} onChange={(e) => setData('valor_causa', e.target.value)} inputMode="decimal" placeholder="0.00" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.valor_causa} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Número do processo (CNJ)</label>
                <input value={data.numero_processo} onChange={(e) => setData('numero_processo', e.target.value)} placeholder="0000000-00.0000.0.00.0000" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.numero_processo} className="mt-1" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Tipo de processo</label>
                <input value={data.tipo_processo} onChange={(e) => setData('tipo_processo', e.target.value)} placeholder="Ex.: Ação ordinária / Execução" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.tipo_processo} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Precatório / RPV</label>
                <select value={String(data.is_precatorio)} onChange={(e) => setData('is_precatorio', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2">
                  <option value="">Indeterminado</option>
                  <option value="precatorio">Precatório</option>
                  <option value="rpv">RPV / Outro</option>
                </select>
                <InputError message={errors.is_precatorio} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Ação</label>
                <input value={data.acao} onChange={(e) => setData('acao', e.target.value)} placeholder="Ex.: Ação declaratória" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.acao} className="mt-1" />
              </div>
            </div>
          </section>

          {/* --------------------- Órgãos e Juízo --------------------- */}
          <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-strong)]">Órgãos e juízo</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Informações sobre origem e competência do processo.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Órgão de origem</label>
                <input value={data.orgao_origem} onChange={(e) => setData('orgao_origem', e.target.value)} placeholder="Ex.: Procuradoria X" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.orgao_origem} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Órgão julgador</label>
                <input value={data.orgao_julgador} onChange={(e) => setData('orgao_julgador', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.orgao_julgador} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Juízo / Vara</label>
                <input value={data.juizo_vara} onChange={(e) => setData('juizo_vara', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.juizo_vara} className="mt-1" />
              </div>
            </div>
          </section>

          {/* --------------------- Números e Prazos --------------------- */}
          <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-strong)]">Números / Prazos</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Identificadores auxiliares e data limite de manifestação.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Número do juízo/vara</label>
                <input value={data.numero_juizo_vara} onChange={(e) => setData('numero_juizo_vara', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.numero_juizo_vara} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Número do agravo</label>
                <input value={data.numero_agravo} onChange={(e) => setData('numero_agravo', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.numero_agravo} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Número da suspensão</label>
                <input value={data.numero_suspensao} onChange={(e) => setData('numero_suspensao', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.numero_suspensao} className="mt-1" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Número do protocolo</label>
                <input value={data.numero_protocolo} onChange={(e) => setData('numero_protocolo', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.numero_protocolo} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Ano</label>
                <input value={data.ano} onChange={(e) => setData('ano', e.target.value)} placeholder="YYYY" inputMode="numeric" className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.ano} className="mt-1" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Prazo (data limite)</label>
                <input type="date" value={data.data_limite} onChange={(e) => setData('data_limite', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                <InputError message={errors.data_limite} className="mt-1" />
              </div>
            </div>
          </section>

          {/* --------------------- Assunto / Ações finais --------------------- */}
          <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Assunto</label>
                <input value={data.assunto} onChange={(e) => setData('assunto', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="Resumo do assunto" />
                <InputError message={errors.assunto} className="mt-1" />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => reset()} className="rounded-lg bg-[var(--surface-muted)] px-4 py-2">Limpar</button>
                <button type="submit" disabled={processing} className="rounded-lg bg-[var(--brand-700)] px-4 py-2 text-white hover:bg-[var(--brand-600)] disabled:opacity-50">
                  {processing ? 'Cadastrando...' : 'Cadastrar processo'}
                </button>
              </div>
            </div>
          </section>

        </form>
      </div>
    </GPDLLayout>
  );
}
