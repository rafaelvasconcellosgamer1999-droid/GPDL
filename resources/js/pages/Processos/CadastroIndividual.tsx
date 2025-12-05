// resources/js/Pages/Processos/CadastroIndividual.tsx
import React, { Fragment, useState } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputError from '@/components/input-error';


type Procurador = { id: number; nome: string };

type ParteItem = {
  id: string; // uuid or idx
  nome: string;
  qualificacao: string;
  tipo_qualificacao: string;
  eh_principal: string; // '1' | '0'
  expediente: string;
};

type FormShape = {
  // etapa 1 - dados basicos
  setor: string;
  instancia: string;
  tribunal: string;
  valor_causa: string;
  numero_processo: string;
  tipo_processo: string;
  is_precatorio: string; // '' | 'precatorio' | 'rpv'
  acao: string;
  assunto: string;
  orgao_origem: string;
  orgao_julgador: string;
  juizo_vara: string;
  numero_juizo_vara: string;
  numero_agravo: string;
  numero_suspensao: string;
  numero_protocolo: string;
  ano: string;
  data_limite: string;

  // etapa 2 - partes (serializado, enviamos como JSON)
  partes_json: string;

  // etapa 3 - distribuicao
  tipo_distribuicao: string;
  motivo_distribuicao: string;
  procurador_responsavel_id: string; // será enviado ao backend
};

export default function CadastroIndividual({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  // steps: 0 = dados basicos, 1 = partes, 2 = distribuicao
  const [step, setStep] = useState<number>(0);

  const { data, setData, post, processing, errors, reset } = useForm<FormShape>({
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

    partes_json: '[]',

    tipo_distribuicao: '',
    motivo_distribuicao: '',
    procurador_responsavel_id: '',
  });

  // local partes array for UX (kept separate from form.data until sync to partes_json)
  const [partes, setPartes] = useState<ParteItem[]>([]);

  // helper to create an empty parte
  const emptyParte = (idx: number): ParteItem => ({
    id: String(Date.now()) + '-' + idx,
    nome: '',
    qualificacao: '',
    tipo_qualificacao: '',
    eh_principal: '0',
    expediente: '',
  });

  // add initial one parte
  React.useEffect(() => {
    if (partes.length === 0) setPartes([emptyParte(0)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addParte() {
    setPartes((p) => [...p, emptyParte(p.length)]);
  }

  function removeParte(id: string) {
    setPartes((p) => p.filter((x) => x.id !== id));
  }

  function updateParte(id: string, field: keyof ParteItem, value: string) {
    setPartes((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  }

  // sync partes -> partes_json on demand (before final submit or when navigating from step 1)
  function syncPartesToForm() {
    setData('partes_json', JSON.stringify(partes.map((p) => ({
      nome: p.nome,
      qualificacao: p.qualificacao,
      tipo_qualificacao: p.tipo_qualificacao,
      eh_principal: p.eh_principal === '1' ? 1 : 0,
      expediente: p.expediente || null,
    }))));
  }

  // helper para ler erros dinamicamente (chaves com pontos, ex: "partes.0.nome")
function getErrorByPath(path: string): string | undefined {
  // o `errors` vindo do useForm tem tipo estático; aqui convertemos para Record para indexar dinâmicamente
  const errs = errors as unknown as Record<string, any> | undefined;
  if (!errs) return undefined;

  const value = errs[path];
  if (!value) return undefined;

  // Inertia normalmente fornece array de mensagens: ['msg1', ...]
  if (Array.isArray(value)) return String(value[0]);
  return String(value);
}

  // client-side minimal validations per step
  function canProceedFromStep(current: number): boolean {
    if (current === 0) {
      // require ao menos assunto ou numero_processo (ajuste conforme regras)
      if (!data.assunto && !data.numero_processo) return false;
      return true;
    }
    if (current === 1) {
      // require at least one parte with nome
      if (!partes || partes.length === 0) return false;
      if (!partes.some((p) => p.nome && p.nome.trim() !== '')) return false;
      return true;
    }
    return true;
  }

  function next() {
    // run validations
    if (!canProceedFromStep(step)) {
      // optional: show small alert? for now, rely on errors / disable next in UI
      return;
    }
    if (step === 1) {
      // sync partes to form before moving on (so backend sees them if the user goes back later)
      syncPartesToForm();
    }
    setStep((s) => Math.min(2, s + 1));
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ensure partes are synced
    syncPartesToForm();

    // prepare payload: convert some fields to expected types
    const payload = {
      ...data,
      is_precatorio: data.is_precatorio === 'precatorio' ? 1 : (data.is_precatorio === 'rpv' ? 0 : null),
      valor_causa: data.valor_causa ? Number(String(data.valor_causa).replace(/[^\d,.-]/g, '').replace(',', '.')) : null,
      procurador_responsavel_id: data.procurador_responsavel_id || null,
    };

    // post to the backend
    post('/processos', {
      preserveScroll: true,
      onSuccess: () => {
        // sucesso: reset form and go back to list
        reset();
        router.get('/processos?view=ativos', {}, { replace: true });
      },
      onError: () => {
        // If backend validation failed, remain on current step so user can fix
      },
    } as any); // Visit options typed differently; cast to avoid TS VisitOptions/data conflict
  }

  // small UI helpers
  const stepTitles = ['Dados básicos', 'Partes', 'Distribuição'];
  const progressPercent = Math.round(((step + 1) / stepTitles.length) * 100);

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Processos', href: '/processos' }, { title: 'Cadastro individual', href: '' }]}>
      <Head title="Processos - Cadastro por etapas" />
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Cadastro individual — Etapa {step + 1} de {stepTitles.length}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{stepTitles[step]}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/processos" className="rounded-lg border px-3 py-2 bg-[var(--surface-muted)] text-sm">Cancelar</Link>
          </div>
        </div>

        {/* progress */}
        <div className="w-full bg-[var(--surface-elevate)] rounded-full h-2 overflow-hidden mb-6">
          <div className="h-2 bg-[var(--brand-700)]" style={{ width: `${progressPercent}%` }} />
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* Step 1: Dados básicos */}
          {step === 0 && (
            <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Setor de atuação</label>
                  <input value={data.setor} onChange={(e) => setData('setor', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="Ex.: Contencioso" />
                  <InputError message={errors.setor} className="mt-1" />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Instância</label>
                  <input value={data.instancia} onChange={(e) => setData('instancia', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="1ª / 2ª / STJ / STF" />
                  <InputError message={errors.instancia} className="mt-1" />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Tribunal</label>
                  <input value={data.tribunal} onChange={(e) => setData('tribunal', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="Ex.: TJPA" />
                  <InputError message={errors.tribunal} className="mt-1" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Valor da causa (R$)</label>
                  <input value={data.valor_causa} onChange={(e) => setData('valor_causa', e.target.value)} inputMode="decimal" placeholder="0.00" className="gpdl-input-contrast w-full px-3 py-2" />
                  <InputError message={errors.valor_causa} className="mt-1" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Número do processo (CNJ)</label>
                  <input value={data.numero_processo} onChange={(e) => setData('numero_processo', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="0000000-00.0000.0.00.0000" />
                  <InputError message={errors.numero_processo} className="mt-1" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Tipo de processo</label>
                  <input value={data.tipo_processo} onChange={(e) => setData('tipo_processo', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                  <InputError message={errors.tipo_processo} className="mt-1" />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Precatório / RPV</label>
                  <select value={data.is_precatorio} onChange={(e) => setData('is_precatorio', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2">
                    <option value="">Indeterminado</option>
                    <option value="precatorio">Precatório</option>
                    <option value="rpv">RPV / Outro</option>
                  </select>
                  <InputError message={errors.is_precatorio} className="mt-1" />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Ação</label>
                  <input value={data.acao} onChange={(e) => setData('acao', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                  <InputError message={errors.acao} className="mt-1" />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Assunto</label>
                <input value={data.assunto} onChange={(e) => setData('assunto', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="Resumo do assunto" />
                <InputError message={errors.assunto} className="mt-1" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Órgão de origem</label>
                  <input value={data.orgao_origem} onChange={(e) => setData('orgao_origem', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
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

              <div className="mt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setStep(1)} disabled={!canProceedFromStep(0)} className={`rounded-lg px-4 py-2 ${canProceedFromStep(0) ? 'bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)]' : 'bg-[var(--surface-muted)] opacity-60'}`}>
                  Próximo
                </button>
              </div>
            </section>
          )}

          {/* Step 2: Partes */}
          
          {step === 1 && (
            <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-strong)]">Partes</h3>
                <p className="text-sm text-[var(--text-muted)]">Cadastre as partes envolvidas no processo. Marque a parte principal.</p>
              </div>

              <div className="mt-4 space-y-4">
                {partes.map((par, idx) => (
                  <div key={par.id} className="rounded-lg border border-dashed p-3 bg-[var(--surface-elevate)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">Nome</label>
                        <input value={par.nome} onChange={(e) => updateParte(par.id, 'nome', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                        <InputError message={getErrorByPath(`partes.${idx}.nome`)} className="mt-1" />
                      </div>

                      <div className="w-40">
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">É parte principal?</label>
                        <select value={par.eh_principal} onChange={(e) => {
                          // if marking principal, unmark others
                          if (e.target.value === '1') {
                            setPartes((p) => p.map((it) => it.id === par.id ? { ...it, eh_principal: '1' } : { ...it, eh_principal: '0' }));
                          } else {
                            updateParte(par.id, 'eh_principal', '0');
                          }
                        }} className="gpdl-input-contrast w-full px-3 py-2">
                          <option value="0">Não</option>
                          <option value="1">Sim</option>
                        </select>
                      </div>

                      <div className="w-44">
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">Tipo de qualificação</label>
                        <input value={par.tipo_qualificacao} onChange={(e) => updateParte(par.id, 'tipo_qualificacao', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" placeholder="Ex.: Pessoa física / Jurídica" />
                      </div>

                      <div className="w-40">
                        <label className="mb-1 block text-xs text-[var(--text-muted)]">Expediente (opcional)</label>
                        <input value={par.expediente} onChange={(e) => updateParte(par.id, 'expediente', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                      </div>

                      <div className="flex items-start">
                        <button type="button" onClick={() => removeParte(par.id)} className="ml-2 rounded px-2 py-1 bg-[var(--surface-muted)]">Remover</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={addParte} className="rounded-lg px-4 py-2 bg-[var(--surface-muted)]">Adicionar parte</button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <button type="button" onClick={() => setStep(0)} className="rounded-lg px-4 py-2 bg-[var(--surface-muted)]">Voltar</button>
                </div>
                <div>
                  <button type="button" onClick={() => { syncPartesToForm(); setStep(2); }} disabled={!canProceedFromStep(1)} className={`rounded-lg px-4 py-2 ${canProceedFromStep(1) ? 'bg-[var(--brand-700)] text-white' : 'bg-[var(--surface-muted)] opacity-60'}`}>Próximo</button>
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Distribuição */}
          {step === 2 && (
            <section className="rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-5 shadow-sm">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-strong)]">Distribuição</h3>
                <p className="text-sm text-[var(--text-muted)]">Escolha o tipo de distribuição e o procurador responsável (última etapa).</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Tipo de distribuição</label>
                  <select value={data.tipo_distribuicao} onChange={(e) => setData('tipo_distribuicao', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2">
                    <option value="">Selecione</option>
                    <option value="manual">Manual</option>
                    <option value="automatica">Automática</option>
                    <option value="equilibrada">Equilibrada</option>
                  </select>
                  <InputError message={errors.tipo_distribuicao} className="mt-1" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Motivo da distribuição (opcional)</label>
                  <input value={data.motivo_distribuicao} onChange={(e) => setData('motivo_distribuicao', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2" />
                  <InputError message={errors.motivo_distribuicao} className="mt-1" />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Procurador responsável</label>
                <select value={data.procurador_responsavel_id} onChange={(e) => setData('procurador_responsavel_id', e.target.value)} className="gpdl-input-contrast w-full px-3 py-2">
                  <option value="">Selecione um procurador</option>
                  {procuradores.map((p) => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
                </select>
                <InputError message={errors.procurador_responsavel_id} className="mt-1" />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)} className="rounded-lg px-4 py-2 bg-[var(--surface-muted)]">Voltar</button>

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={processing} className="rounded-lg px-4 py-2 bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] disabled:opacity-50">
                    {processing ? 'Gravando...' : 'Salvar processo'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </form>
      </div>
    </GPDLLayout>
  );
}
