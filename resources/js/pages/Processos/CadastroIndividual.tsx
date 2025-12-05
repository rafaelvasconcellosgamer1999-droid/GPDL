// resources/js/Pages/Processos/CadastroIndividual.tsx
import React, { useState, useEffect } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Check, Info, UserPlus, FileText, Users, ArrowLeft, ArrowRight } from 'lucide-react';

type Procurador = { id: number; nome: string };

type ParteItem = {
  id: string;
  nome: string;
  qualificacao: string;
  tipo_qualificacao: string;
  eh_principal: string; // '1' | '0'
  expediente: string;
};

type FormShape = {
  setor: string;
  instancia: string;
  tribunal: string;
  valor_causa: string;
  numero_processo: string;
  tipo_processo: string;
  is_precatorio: string;
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

  partes_json: string;

  tipo_distribuicao: string;
  motivo_distribuicao: string;
  procurador_responsavel_id: string;
};

export default function CadastroIndividual({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  const [step, setStep] = useState<number>(0);
  const stepTitles = ['Dados básicos', 'Partes', 'Distribuição'];

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

  // helper to safely read dynamic error keys
  function getErrorByPath(path: string): string | undefined {
    const errs = errors as unknown as Record<string, any> | undefined;
    if (!errs) return undefined;
    const value = errs[path];
    if (!value) return undefined;
    if (Array.isArray(value)) return String(value[0]);
    return String(value);
  }

  // Partes local state (UX)
  const [partes, setPartes] = useState<ParteItem[]>([]);
  useEffect(() => {
    if (partes.length === 0) setPartes([{ id: 'p0', nome: '', qualificacao: '', tipo_qualificacao: '', eh_principal: '0', expediente: '' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyParte = (idx: number): ParteItem => ({
    id: `p${Date.now()}-${idx}`,
    nome: '',
    qualificacao: '',
    tipo_qualificacao: '',
    eh_principal: '0',
    expediente: '',
  });

  function addParte() {
    setPartes((p) => [...p, emptyParte(p.length)]);
  }
  function removeParte(id: string) {
    setPartes((p) => p.filter((x) => x.id !== id));
  }
  function updateParte(id: string, field: keyof ParteItem, value: string) {
    setPartes((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  }

  function syncPartesToForm() {
    setData(
      'partes_json',
      JSON.stringify(
        partes.map((p) => ({
          nome: p.nome,
          qualificacao: p.qualificacao,
          tipo_qualificacao: p.tipo_qualificacao,
          eh_principal: p.eh_principal === '1' ? 1 : 0,
          expediente: p.expediente || null,
        })),
      ),
    );
  }

  function canProceedFromStep(current: number): boolean {
    if (current === 0) {
      return Boolean(data.assunto || data.numero_processo); // minimal rule
    }
    if (current === 1) {
      if (!partes || partes.length === 0) return false;
      if (!partes.some((p) => p.nome && p.nome.trim() !== '')) return false;
      return true;
    }
    return true;
  }

  function next() {
    if (!canProceedFromStep(step)) return;
    if (step === 1) syncPartesToForm();
    setStep((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatCurrencyPreview(v?: string) {
    if (!v) return '-';
    try {
      const only = String(v).replace(/[^\d,.-]/g, '').replace(',', '.');
      const n = Number(only);
      if (isNaN(n)) return v;
      return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch {
      return v;
    }
  }

  function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    syncPartesToForm();

    // coerce values (keeping strings for useForm compatibility)
    setData('is_precatorio', String(data.is_precatorio));
    setData('valor_causa', String(data.valor_causa || ''));

    post(
      '/processos',
      ({
        preserveScroll: true,
        onSuccess: () => {
          reset();
          router.get('/processos?view=ativos', {}, { replace: true });
        },
        onError: () => {
          // remain on step to let user fix
        },
      } as any),
    );
  }

  // StepDot consistent with design tokens
  function StepDot({ i }: { i: number }) {
    const active = i === step;
    const done = i < step;
    const base = 'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold';
    const doneCls = 'bg-[var(--brand-600)] text-white shadow-sm';
    const activeCls = 'bg-[var(--brand-700)] text-white';
    const idleCls = 'bg-[var(--surface-elevate)] text-[var(--text-muted)] border border-[var(--gpdl-border)]';
    return (
      <div className="flex items-center gap-3">
        <div className={`${base} ${done ? doneCls : active ? activeCls : idleCls}`}>
          {done ? <Check className="h-4 w-4" /> : i + 1}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stepTitles[i]}</div>
      </div>
    );
  }

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Processos', href: '/processos' }, { title: 'Cadastro individual', href: '' }]}>
      <Head title="Processos - Cadastro por etapas" />
      <div className="mt-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-strong)' }}>Cadastrar processo (por etapas)</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Preencha as etapas; a distribuição (procurador) é a etapa final.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/processos" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-muted)', color: 'var(--text-strong)' }}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </div>
        </div>

        {/* stepper */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <StepDot i={i} />
                {i < 2 && <div className="h-0.5 rounded" style={{ width: 60, background: 'var(--gpdl-border)' }} />}
              </div>
            ))}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Progresso: <span style={{ color: 'var(--brand-700)', fontWeight: 600 }}>{Math.round(((step + 1) / 3) * 100)}%</span></div>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* STEP 1 */}
          {step === 0 && (
            <section className="gpdl-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
                <div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-strong)' }}>Dados básicos</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Informações identificadoras e financeiras do processo.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Setor de atuação <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(opcional)</span></label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.setor} onChange={(e) => setData('setor', e.target.value)} placeholder="Ex.: Contencioso" />
                  <InputError message={getErrorByPath('setor')} className="mt-1" />
                </div>

                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Instância</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.instancia} onChange={(e) => setData('instancia', e.target.value)} placeholder="1ª / 2ª / STJ / STF" />
                  <InputError message={getErrorByPath('instancia')} className="mt-1" />
                </div>

                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Tribunal</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.tribunal} onChange={(e) => setData('tribunal', e.target.value)} placeholder="Ex.: TJPA" />
                  <InputError message={getErrorByPath('tribunal')} className="mt-1" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Valor da causa</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>R$</span>
                    <input className="gpdl-input-contrast flex-1 px-3 py-2 rounded-md" value={data.valor_causa} onChange={(e) => setData('valor_causa', e.target.value)} placeholder="0,00" />
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Preview: <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{formatCurrencyPreview(data.valor_causa)}</span></div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Número do processo (CNJ)</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.numero_processo} onChange={(e) => setData('numero_processo', e.target.value)} placeholder="0000000-00.0000.0.00.0000" />
                  <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><Info className="h-3 w-3" /> <span>Sem formatação obrigatória — o backend valida.</span></div>
                  <InputError message={getErrorByPath('numero_processo')} className="mt-1" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Tipo de processo</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.tipo_processo} onChange={(e) => setData('tipo_processo', e.target.value)} />
                  <InputError message={getErrorByPath('tipo_processo')} className="mt-1" />
                </div>

                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Precatório / RPV</label>
                  <select className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.is_precatorio} onChange={(e) => setData('is_precatorio', e.target.value)}>
                    <option value="">Indeterminado</option>
                    <option value="precatorio">Precatório</option>
                    <option value="rpv">RPV / Outro</option>
                  </select>
                  <InputError message={getErrorByPath('is_precatorio')} className="mt-1" />
                </div>

                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Ação</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.acao} onChange={(e) => setData('acao', e.target.value)} />
                  <InputError message={getErrorByPath('acao')} className="mt-1" />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Assunto</label>
                <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.assunto} onChange={(e) => setData('assunto', e.target.value)} placeholder="Resumo do assunto" />
                <InputError message={getErrorByPath('assunto')} className="mt-1" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Órgão de origem</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.orgao_origem} onChange={(e) => setData('orgao_origem', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Órgão julgador</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.orgao_julgador} onChange={(e) => setData('orgao_julgador', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Número do agravo</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.numero_agravo} onChange={(e) => setData('numero_agravo', e.target.value)} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Número da suspensão</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.numero_suspensao} onChange={(e) => setData('numero_suspensao', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Número do protocolo</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.numero_protocolo} onChange={(e) => setData('numero_protocolo', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Ano</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.ano} onChange={(e) => setData('ano', e.target.value)} inputMode="numeric" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 items-end">
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Prazo (data limite)</label>
                  <input type="date" className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.data_limite} onChange={(e) => setData('data_limite', e.target.value)} />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Os campos podem ser editados nas próximas etapas.</div>
                <div>
                  <button type="button" onClick={next} disabled={!canProceedFromStep(0)} className={`btn-gradient rounded-lg px-4 py-2 ${!canProceedFromStep(0) ? 'opacity-60 pointer-events-none' : ''}`}>
                    Próximo <ArrowRight className="h-4 w-4 inline-block ml-2" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <section className="gpdl-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
                <div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-strong)' }}>Partes</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cadastre as partes, indicando a principal e a qualificação.</p>
                </div>
              </div>

              <div className="space-y-4">
                {partes.map((par, idx) => (
                  <div key={par.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-elevate)' }}>
                    <div className="flex flex-wrap gap-3 items-start">
                      <div className="flex-1 min-w-[220px]">
                        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Nome</label>
                        <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={par.nome} onChange={(e) => updateParte(par.id, 'nome', e.target.value)} />
                        <InputError message={getErrorByPath(`partes.${idx}.nome`)} className="mt-1" />
                      </div>

                      <div className="w-56">
                        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Qualificação</label>
                        <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={par.qualificacao} onChange={(e) => updateParte(par.id, 'qualificacao', e.target.value)} />
                      </div>

                      <div className="w-48">
                        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Tipo de qualificação</label>
                        <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={par.tipo_qualificacao} onChange={(e) => updateParte(par.id, 'tipo_qualificacao', e.target.value)} />
                      </div>

                      <div className="w-28">
                        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Parte principal?</label>
                        <select className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={par.eh_principal} onChange={(e) => {
                          if (e.target.value === '1') {
                            setPartes((p) => p.map((it) => (it.id === par.id ? { ...it, eh_principal: '1' } : { ...it, eh_principal: '0' })));
                          } else {
                            updateParte(par.id, 'eh_principal', '0');
                          }
                        }}>
                          <option value="0">Não</option>
                          <option value="1">Sim</option>
                        </select>
                      </div>

                      <div className="w-44">
                        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Expediente (opcional)</label>
                        <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={par.expediente} onChange={(e) => updateParte(par.id, 'expediente', e.target.value)} />
                      </div>

                      <div className="flex items-start">
                        <button type="button" onClick={() => removeParte(par.id)} className="ml-2 rounded px-2 py-1" style={{ background: 'var(--surface-muted)', border: '1px solid var(--gpdl-border)' }}>Remover</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={addParte} className="rounded-lg px-4 py-2" style={{ background: 'var(--surface-muted)', border: '1px solid var(--gpdl-border)' }}>
                  <UserPlus className="h-4 w-4 inline-block mr-2" /> Adicionar parte
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={prev} className="rounded-lg px-4 py-2" style={{ background: 'var(--surface-muted)', border: '1px solid var(--gpdl-border)' }}>
                  <ArrowLeft className="h-4 w-4 inline-block mr-2" /> Voltar
                </button>

                <div>
                  <button type="button" onClick={() => { syncPartesToForm(); next(); }} disabled={!canProceedFromStep(1)} className={`btn-gradient rounded-lg px-4 py-2 ${!canProceedFromStep(1) ? 'opacity-60 pointer-events-none' : ''}`}>
                    Próximo
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <section className="gpdl-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
                <div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-strong)' }}>Distribuição</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Defina a distribuição e selecione o procurador responsável (última etapa).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Tipo de distribuição</label>
                  <select className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.tipo_distribuicao} onChange={(e) => setData('tipo_distribuicao', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="manual">Manual</option>
                    <option value="automatica">Automática</option>
                    <option value="equilibrada">Equilibrada</option>
                  </select>
                  <InputError message={getErrorByPath('tipo_distribuicao')} className="mt-1" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Motivo da distribuição (opcional)</label>
                  <input className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.motivo_distribuicao} onChange={(e) => setData('motivo_distribuicao', e.target.value)} />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Procurador responsável</label>
                <select className="gpdl-input-contrast mt-1 w-full px-3 py-2 rounded-md" value={data.procurador_responsavel_id} onChange={(e) => setData('procurador_responsavel_id', e.target.value)}>
                  <option value="">Selecione um procurador</option>
                  {procuradores.map((p) => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
                </select>
                <InputError message={getErrorByPath('procurador_responsavel_id')} className="mt-1" />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={prev} className="rounded-lg px-4 py-2" style={{ background: 'var(--surface-muted)', border: '1px solid var(--gpdl-border)' }}>
                  <ArrowLeft className="h-4 w-4 inline-block mr-2" /> Voltar
                </button>

                <div>
                  <button type="submit" disabled={processing} className="btn-gradient rounded-lg px-4 py-2">
                    {processing ? 'Gravando...' : 'Salvar processo'} <Check className="h-4 w-4 inline-block ml-2" />
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
