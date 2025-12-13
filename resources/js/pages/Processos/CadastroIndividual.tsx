// resources/js/Pages/Processos/CadastroIndividual.tsx
import React, { useState, useMemo, SelectHTMLAttributes, ChangeEvent } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AutocompleteSearch from '@/components/autocomplete-search';
import { Check, Info, UserPlus, Users, ArrowLeft, ArrowRight, Scale, Calculator, ChevronDown, Trash2 } from 'lucide-react';
import { Errors } from '@inertiajs/core';

// --- Tipos ---
type Procurador = { id: number; nome: string };
export type OptionItem = { id: string | number; nome: string };

type ParteItem = {
  id: string;
  nome: string;
  cpf: string;
  qualificacao: string;
  tipo_qualificacao: string;
  eh_principal: string; // '1' | '0'
  expediente: string; // '1' | '0'
};

type FormShape = {
  instancia: string;
  tribunal: string;
  valor_causa: string;
  numero_processo: string;
  tipo_processo: string;
  tipo_pagamento: string;
  acao: string;
  assunto: string;
  orgao_origem: string;
  orgao_julgador: string;
  juizo_vara: string;
  numero_juizo_vara: string;
  numero_agravo: string;
  numero_suspensao: string;
  numero_protocolo: string;
  partes_json: string;
  tipo_distribuicao: string;
  motivo_distribuicao: string;
  procurador_responsavel_id: string;
  incidencia?: string; // '1' | '0'
  referencia_numero_processo?: string;
};

// --- ESTILOS COMPARTILHADOS (Compactos) ---
const INPUT_BASE_CLASS = "gpdl-input-contrast w-full px-3 py-2 text-sm rounded-lg border-0 ring-1 ring-[var(--gpdl-border)] focus:ring-2 focus:ring-[var(--brand-500)]";
const LABEL_BASE_CLASS = "block text-xs font-bold uppercase tracking-wide mb-1 opacity-70";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className={LABEL_BASE_CLASS} style={{ color: 'var(--text-strong)' }}>
    {children}
  </label>
);

interface CustomSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { id: string | number; nome: string }[];
  placeholder?: string;
}

const CustomSelect = ({ label, value, onChange, options, error, placeholder = "Selecione", ...props }: CustomSelectProps) => (
  <div className="w-full relative">
    {label && <Label>{label}</Label>}
    <div className="relative">
      <select
        className={`${INPUT_BASE_CLASS} appearance-none cursor-pointer pr-8`}
        value={value}
        onChange={onChange}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.nome}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-50">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
    {error && <InputError message={error} className="mt-1" />}
  </div>
);

// Helper function declared outside component to avoid recreation
const createEmptyParte = (idx: number): ParteItem => ({
  id: `p${Date.now()}-${idx}`,
  nome: '',
  cpf: '',
  qualificacao: 'Pessoa Física',
  tipo_qualificacao: 'Autor',
  eh_principal: '0',
  expediente: '0',
});

export default function CadastroIndividual({
  procuradores = [] as Procurador[],
  setorSelecionado = '',
  setores = [] as OptionItem[],
  tribunais = [] as OptionItem[],
  acoes = [] as OptionItem[],
}: {
  procuradores?: Procurador[];
  setorSelecionado?: string;
  setores?: OptionItem[];
  tribunais?: OptionItem[];
  acoes?: OptionItem[];
  orgaos?: OptionItem[];
  orgaosJulgadores?: OptionItem[];
}) {
  const [step, setStep] = useState<number>(0);
  const stepTitles = ['Dados básicos', 'Partes', 'Distribuição'];

  // --- Constantes ---
  const INSTANCIAS = [{ id: '1ª', nome: '1ª' }, { id: '2ª', nome: '2ª' }, { id: 'STJ', nome: 'STJ' }, { id: 'STF', nome: 'STF' }];
  const TIPOS_PROCESSO = [{ id: 'Cível', nome: 'Cível' }, { id: 'Trabalhista', nome: 'Trabalhista' }, { id: 'Tributário', nome: 'Tributário' }, { id: 'Administrativo', nome: 'Administrativo' }, { id: 'Outros', nome: 'Outros' }];
  const TIPO_PAGAMENTO_OPTIONS = [{ id: 'precatorio', nome: 'Precatório' }, { id: 'rpv', nome: 'RPV / Outro' }];
  const QUALIFICACOES = [{ id: 'Pessoa Física', nome: 'Pessoa Física' }, { id: 'Pessoa Jurídica', nome: 'Pessoa Jurídica' }, { id: 'Entidade Pública', nome: 'Entidade Pública' }, { id: 'Outro', nome: 'Outro' }];
  const TIPO_QUALIFICACAO = [{ id: 'Autor', nome: 'Autor' }, { id: 'Réu', nome: 'Réu' }, { id: 'Interessado', nome: 'Interessado' }, { id: 'Testemunha', nome: 'Testemunha' }, { id: 'Outro', nome: 'Outro' }];
  const EXPEDIENTE_OPTIONS = [{ id: '1', nome: 'Sim' }, { id: '0', nome: 'Não' }];
  const DIST_TYPES = [{ id: 'manual', nome: 'Manual' }, { id: 'automatica', nome: 'Automática' }, { id: 'equilibrada', nome: 'Equilibrada' }];
  const DIST_MOTIVOS = [{ id: 'rotina', nome: 'Rotina' }, { id: 'urgencia', nome: 'Urgência' }, { id: 'competencia', nome: 'Competência' }, { id: 'sobrecarga', nome: 'Equilíbrio de carga' }];

  const { data, setData, post, processing, errors, reset } = useForm<FormShape>({
    instancia: '', tribunal: '', valor_causa: '', numero_processo: '', tipo_processo: '', tipo_pagamento: '',
    acao: '', assunto: '', orgao_origem: '', orgao_julgador: '', juizo_vara: '', numero_juizo_vara: '',
    numero_agravo: '', numero_suspensao: '', numero_protocolo: '', partes_json: '[]',
    tipo_distribuicao: '', motivo_distribuicao: '', procurador_responsavel_id: '', incidencia: '0', referencia_numero_processo: '',
  });

  // Inicialização do estado já com um item vazio para evitar useEffect síncrono
  const [partes, setPartes] = useState<ParteItem[]>([createEmptyParte(0)]);

  function getErrorByPath(path: string): string | undefined {
    const errs: Errors | undefined = errors;
    if (!errs) return undefined;
    const value = errs[path];
    if (value === undefined) return undefined;
    if (Array.isArray(value)) return String(value[0]);
    return String(value);
  }

  const displaySetor = useMemo(() => {
    if (!setorSelecionado) return '';
    try {
      const found = (setores || []).find((s) => String(s.id) === String(setorSelecionado) || String(s.nome) === String(setorSelecionado));
      if (found) return found.nome;
    } catch { /* ignore */ }
    return String(setorSelecionado);
  }, [setorSelecionado, setores]);

  function addParte() { setPartes((p) => [...p, createEmptyParte(p.length)]); }
  function removeParte(id: string) { if (partes.length <= 1) return; setPartes((p) => p.filter((x) => x.id !== id)); }
  function updateParte(id: string, field: keyof ParteItem, value: string) { setPartes((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x))); }

  function syncPartesToForm() {
    setData('partes_json', JSON.stringify(partes.map((p) => ({ ...p, eh_principal: p.eh_principal === '1' ? 1 : 0, expediente: p.expediente === '1' ? 1 : 0 }))));
  }

  function canProceedFromStep(current: number): boolean {
    if (current === 0) return Boolean(data.assunto || data.numero_processo);
    if (current === 1) return partes && partes.length > 0 && partes.some((p) => p.nome && p.nome.trim() !== '');
    return true;
  }

  function next() {
    if (!canProceedFromStep(step)) return;
    if (step === 1) syncPartesToForm();
    setStep((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prev() { setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function formatCNJInput(raw?: string) {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '').slice(0, 20);
    const partsLen = [7, 2, 4, 1, 2, 4];
    let idx = 0; const parts: string[] = [];
    for (const len of partsLen) { if (idx >= digits.length) break; parts.push(digits.slice(idx, idx + len)); idx += len; }
    if (parts.length === 0) return '';
    let out = parts[0] ?? '';
    for (let i = 1; i < parts.length; i++) { out += (['-', '.', '.', '.', '.'][i - 1] || '.') + parts[i]; }
    return out;
  }

  function handleNumeroProcessoChange(e: ChangeEvent<HTMLInputElement>) { setData('numero_processo', formatCNJInput(e.target.value)); }
  function handleNumeroProcessoPaste(e: React.ClipboardEvent<HTMLInputElement>) { e.preventDefault(); setData('numero_processo', formatCNJInput(e.clipboardData.getData('text'))); }
  function handleReferenciaChange(e: ChangeEvent<HTMLInputElement>) { setData('referencia_numero_processo', formatCNJInput(e.target.value)); }
  function handleReferenciaPaste(e: React.ClipboardEvent<HTMLInputElement>) { e.preventDefault(); setData('referencia_numero_processo', formatCNJInput(e.clipboardData.getData('text'))); }

  function formatCPFInput(raw?: string) {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '').slice(0, 14);
    return digits.length <= 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  function handleParteCPFChange(id: string, value: string) {
    const formatted = formatCPFInput(value);
    updateParte(id, 'cpf', formatted);
  }

  function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    syncPartesToForm();
    setData('tipo_pagamento', String(data.tipo_pagamento));
    setData('valor_causa', String(data.valor_causa || ''));
    post('/processos', { preserveScroll: true, onSuccess: () => { setStep(0); reset(); router.get('/processos/cadastro', {}, { replace: true }); } });
  }

  function StepDot({ i }: { i: number }) {
    const active = i === step; const done = i < step;
    const base = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 relative z-10';
    const doneCls = 'bg-[var(--brand-600)] border-[var(--brand-600)] text-white';
    const activeCls = 'bg-[var(--surface-card)] border-[var(--brand-600)] text-[var(--brand-600)] shadow-lg scale-110';
    const idleCls = 'bg-[var(--surface-muted)] border-[var(--gpdl-border)] text-[var(--text-muted)]';

    return (
      <div className="flex flex-col items-center gap-1.5 relative">
        <div className={`${base} ${done ? doneCls : active ? activeCls : idleCls}`}>
          {done ? <Check className="h-4 w-4" /> : i + 1}
        </div>
        <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: active ? 'var(--text-strong)' : 'var(--text-muted)' }}>{stepTitles[i]}</div>
      </div>
    );
  }

  const sectionHeaderClass = "flex items-center gap-3 mb-5 border-b pb-3";
  const iconBoxClass = "p-2 rounded-lg text-white shadow-md";

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Processos', href: '/processos' }, { title: 'Cadastro', href: '/processos/cadastro' }]}>
      <Head title="Cadastro" />

      {/* Full Width Layout: w-full e px-6 para ocupar a tela toda */}
      <div className="mt-4 pb-8 w-full px-6">

        {/* Header Compacto */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-strong)' }}>Cadastrar processo</h1>
            {displaySetor && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-0.5 text-xs shadow-sm" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--brand-500)' }}></span>
                <span className="font-semibold uppercase" style={{ color: 'var(--text-strong)' }}>{displaySetor}</span>
              </div>
            )}
          </div>
          <Link
            href="/processos?view=cadastro"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium hover:shadow-sm"
            style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-card)', color: 'var(--text-strong)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>

        {/* Stepper Compacto */}
        <div className="mb-8 relative mx-4 md:mx-0">
          <div className="absolute top-4 left-0 w-full h-0.5 rounded-full opacity-30" style={{ background: 'var(--gpdl-border)' }} />
          <div className="absolute top-4 left-0 h-0.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 2) * 100}%`, backgroundColor: 'var(--brand-600)' }} />
          <div className="flex justify-between w-full relative z-10">
            {[0, 1, 2].map((i) => (<div key={i} className="flex-1 flex justify-center first:justify-start last:justify-end"><StepDot i={i} /></div>))}
          </div>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-6">

          {/* STEP 1 */}
          {step === 0 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}>
                <div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}><Scale className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Dados básicos</h3>
                </div>
              </div>

              {/* Grid Denso */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-2">
                  <CustomSelect label="Instância" value={data.instancia} onChange={(e) => setData('instancia', e.target.value)} options={INSTANCIAS} error={getErrorByPath('instancia')} placeholder="-" />
                </div>
                <div className="md:col-span-7">
                  <Label>Tribunal</Label>
                  <div className="w-full">
                    <AutocompleteSearch
                      placeholder="Buscar tribunal..."
                      value={data.tribunal}
                      onChange={(value) => setData('tribunal', String(value))}
                      onSearch={async (query) => { try { const r = await fetch(`/api/tribunais?search=${encodeURIComponent(query)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; } }}
                      options={tribunais}
                      error={getErrorByPath('tribunal')}
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Label>Valor da causa</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50" style={{ color: 'var(--text-muted)' }}>R$</span>
                    <input className={`${INPUT_BASE_CLASS} pl-8 font-medium`} value={data.valor_causa} onChange={(e) => setData('valor_causa', e.target.value)} placeholder="0,00" />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-8">
                  <Label>Número do processo (CNJ)</Label>
                  <input className={`${INPUT_BASE_CLASS} font-mono tracking-wide`} value={data.numero_processo} onChange={handleNumeroProcessoChange} onPaste={handleNumeroProcessoPaste} placeholder="0000000-00.0000.0.00.0000" />
                  <InputError message={getErrorByPath('numero_processo')} className="mt-1" />
                </div>
                <div className="md:col-span-4">
                  <CustomSelect label="Tipo de processo" value={data.tipo_processo} onChange={(e) => setData('tipo_processo', e.target.value)} options={TIPOS_PROCESSO} error={getErrorByPath('tipo_processo')} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><CustomSelect label="Tipo de pagamento" placeholder="Indeterminado" value={data.tipo_pagamento} onChange={(e) => setData('tipo_pagamento', e.target.value)} options={TIPO_PAGAMENTO_OPTIONS} /></div>
                <div>
                  <Label>Ação</Label>
                  <div className="w-full">
                    <AutocompleteSearch placeholder="Buscar ação..." value={data.acao} onChange={(val) => setData('acao', String(val))} onSearch={async (q) => { try { const r = await fetch(`/api/acoes?search=${encodeURIComponent(q)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; } }} options={acoes} error={getErrorByPath('acao')} />
                  </div>
                </div>
                <div>
                  <Label>Assunto</Label>
                  <div className="w-full">
                    <AutocompleteSearch placeholder="Buscar assunto..." value={data.assunto} onChange={(val) => setData('assunto', String(val))} onSearch={async (q) => { try { const r = await fetch(`/api/assuntos?search=${encodeURIComponent(q)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; } }} options={[]} error={getErrorByPath('assunto')} />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label>Órgão de origem</Label><div className="w-full"><AutocompleteSearch placeholder="Buscar..." value={data.orgao_origem} onChange={(v) => setData('orgao_origem', String(v))} onSearch={async (q) => { try { const r = await fetch(`/api/orgao-origem?search=${encodeURIComponent(q)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; } }} options={[]} /></div></div>
                <div><Label>Órgão julgador</Label><div className="w-full"><AutocompleteSearch placeholder="Buscar..." value={data.orgao_julgador} onChange={(v) => setData('orgao_julgador', String(v))} onSearch={async (q) => { try { const r = await fetch(`/api/orgao-julgador?search=${encodeURIComponent(q)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; } }} options={[]} /></div></div>
              </div>

              <div className="mt-6 p-4 rounded-xl border bg-opacity-50" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)' }}>
                <div className="mb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-strong)' }}>
                  <Info className="w-3.5 h-3.5 text-(--brand-500)" /> Números Adicionais
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><Label>Agravo</Label><input className={INPUT_BASE_CLASS} value={data.numero_agravo} onChange={(e) => setData('numero_agravo', e.target.value)} /></div>
                  <div><Label>Suspensão</Label><input className={INPUT_BASE_CLASS} value={data.numero_suspensao} onChange={(e) => setData('numero_suspensao', e.target.value)} /></div>
                  <div><Label>Protocolo</Label><input className={INPUT_BASE_CLASS} value={data.numero_protocolo} onChange={(e) => setData('numero_protocolo', e.target.value)} /></div>
                </div>
              </div>

              <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <label className="inline-flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-(--surface-muted) transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-400 text-(--brand-600)" checked={data.incidencia === '1'} onChange={(e) => setData('incidencia', e.target.checked ? '1' : '0')} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Processo é incidente?</span>
                </label>
                {data.incidencia === '1' && (
                  <div className="mt-3 pl-4 border-l-4 ml-2" style={{ borderColor: 'var(--brand-600)' }}>
                    <Label>Número CNJ Referenciado</Label>
                    <input className={`${INPUT_BASE_CLASS} font-mono max-w-sm`} value={data.referencia_numero_processo} onChange={handleReferenciaChange} onPaste={handleReferenciaPaste} placeholder="0000000-00.0000.0.00.0000" />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <button type="button" onClick={next} disabled={!canProceedFromStep(0) || processing} className={`btn-gradient rounded-lg px-6 py-2.5 text-sm font-semibold flex items-center gap-2 text-white shadow-md ${!canProceedFromStep(0) ? 'opacity-50' : ''}`}>
                  Próximo <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}>
                <div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}><Users className="h-5 w-5" /></div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Partes envolvidas</h3>
              </div>
              <div className="space-y-4">
                {partes.map((par, idx) => (
                  <div key={par.id} className="rounded-xl border p-4 relative hover:shadow-sm transition-shadow" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-muted)' }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                      <div className="md:col-span-4">
                        <Label>Nome</Label><input className={INPUT_BASE_CLASS} value={par.nome} onChange={(e) => updateParte(par.id, 'nome', e.target.value)} />
                        <InputError message={getErrorByPath(`partes.${idx}.nome`) || getErrorByPath(`partes_json.${idx}.nome`)} className="mt-1" />
                      </div>
                      <div className="md:col-span-3"><Label>CPF/CNPJ</Label><input className={`${INPUT_BASE_CLASS} font-mono`} value={par.cpf} onChange={(e) => handleParteCPFChange(par.id, e.target.value)} placeholder="000.000.000-00" /></div>
                      <div className="md:col-span-3"><CustomSelect label="Qualificação" value={par.qualificacao} onChange={(e) => updateParte(par.id, 'qualificacao', e.target.value)} options={QUALIFICACOES} /></div>
                      <div className="md:col-span-2"><CustomSelect label="Tipo" value={par.tipo_qualificacao} onChange={(e) => updateParte(par.id, 'tipo_qualificacao', e.target.value)} options={TIPO_QUALIFICACAO} /></div>

                      <div className="md:col-span-12 flex flex-col md:flex-row items-center gap-6 border-t border-dashed pt-3" style={{ borderColor: 'var(--gpdl-border)' }}>
                        <div className="flex gap-4 w-full md:w-auto">
                          <CustomSelect label="Principal?" value={par.eh_principal} onChange={(e) => updateParte(par.id, 'eh_principal', e.target.value)} options={[{ id: '0', nome: 'Não' }, { id: '1', nome: 'Sim' }]} />
                          <CustomSelect label="Expediente?" value={par.expediente} onChange={(e) => updateParte(par.id, 'expediente', e.target.value)} options={EXPEDIENTE_OPTIONS} />
                        </div>
                        <div className="ml-auto">
                          <button type="button" onClick={() => removeParte(par.id)} disabled={partes.length <= 1} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 text-xs font-bold uppercase"><Trash2 className="h-3.5 w-3.5" /> Remover</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <button type="button" onClick={addParte} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110" style={{ color: 'var(--brand-700)', backgroundColor: 'var(--accent-info-soft)', border: '1px solid var(--accent-info-border)' }}><UserPlus className="h-4 w-4" /> Adicionar parte</button>
                <div className="flex gap-3">
                  <button type="button" onClick={prev} className="px-5 py-2 rounded-lg border text-sm font-medium hover:shadow-sm" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)', color: 'var(--text-strong)' }}>Voltar</button>
                  <button type="button" onClick={() => { syncPartesToForm(); next(); }} disabled={!canProceedFromStep(1)} className={`btn-gradient rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-md ${!canProceedFromStep(1) ? 'opacity-50' : ''}`}>Próximo <ArrowRight className="h-4 w-4 inline-block ml-1" /></button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}>
                <div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}><Calculator className="h-5 w-5" /></div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Distribuição</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><CustomSelect label="Tipo" value={data.tipo_distribuicao} onChange={(e) => setData('tipo_distribuicao', e.target.value)} options={DIST_TYPES} error={getErrorByPath('tipo_distribuicao')} /></div>
                <div className="md:col-span-2"><CustomSelect label="Motivo (Opcional)" placeholder="Nenhum" value={data.motivo_distribuicao} onChange={(e) => setData('motivo_distribuicao', e.target.value)} options={DIST_MOTIVOS} /></div>
              </div>
              <div className="mt-5">
                <Label>Procurador</Label>
                <div className="w-full">
                  <AutocompleteSearch placeholder="Selecione um procurador" 
                  value={data.procurador_responsavel_id} 
                  onChange={(val) => setData('procurador_responsavel_id', String(val))} 
                  onSearch={async (q) => { try { return procuradores.filter(p => 
                  p.nome.toLowerCase().includes(q.toLowerCase())).map(p => 
                  ({ id: String(p.id), nome: p.nome })); } catch { return []; } }} 
                  options={procuradores.map(p => ({ id: String(p.id), nome: p.nome }))} 
                  error={getErrorByPath('procurador_responsavel_id')} />
                </div>
              </div>
              <div className="mt-8 flex justify-between border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <button type="button" onClick={prev} className="px-5 py-2 rounded-lg border text-sm font-medium hover:shadow-sm" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)', color: 'var(--text-strong)' }}>Voltar</button>
                <button type="submit" disabled={processing} className="btn-gradient rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-70">{processing ? 'Gravando...' : 'Salvar'} <Check className="h-4 w-4 inline-block ml-1" /></button>
              </div>
            </section>
          )}
        </form>
      </div>
    </GPDLLayout>
  );
}