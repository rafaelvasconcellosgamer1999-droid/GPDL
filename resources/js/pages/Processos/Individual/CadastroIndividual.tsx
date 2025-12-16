import React, { useState, useCallback, useMemo, SelectHTMLAttributes, ChangeEvent, useEffect } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AutocompleteSearch from '@/components/autocomplete-search';
import { 
  Check, Info, UserPlus, Users, ArrowRight, Scale, Calculator, 
  ChevronDown, Trash2, Pencil, Search, X, FileText, Flag, User 
} from 'lucide-react';

// --- Interfaces de Tipagem ---
type Procurador = { id: number; nome: string };
export type OptionItem = { id: string | number; nome: string };

// Interface para resposta da API de partes
interface ParteApiResponse {
  id: number;
  nome: string;
  cpf?: string;
  cpf_cnpj?: string;
  tipo_parte?: string;
  qualificacao?: string;
}

// Interface para os dados vindos do banco (Edição)
interface ProcessoEditData {
  id: number;
  cnj?: string;
  area_atuacao?: string;
  instancia?: string;
  valor_causa?: string;
  numero_processo?: string;
  tipo_processo?: string;
  tipo_pagamento?: string;
  numero_agravo?: string;
  numero_suspensao?: string;
  numero_protocolo?: string;
  tipo_distribuicao?: string;
  motivo_distribuicao?: string;
  procurador_responsavel_id?: number | string;
  processo_ref_id?: number | string;
  // Relacionamentos
  tribunal?: { id: number; nome: string };
  tribunal_id?: number;
  acao?: { id: number; nome: string };
  acao_id?: number;
  assunto?: { id: number; nome: string };
  assunto_id?: number;
  orgao_origem?: { id: number; nome: string };
  orgao_origem_id?: number;
  orgao_julgador?: { id: number; nome: string };
  orgao_julgador_id?: number;
  procurador_responsavel?: { id: number; nome: string };
  // Partes com Pivot
  partes?: Array<{
    id: number;
    nome: string;
    cpf_cnpj?: string;
    pivot?: {
      qualificacao?: string;
      tipo_qualificacao?: string;
      parte_principal?: number;
      expediente?: number;
    }
  }>;
}

type ParteItem = {
  id: string;
  nome: string;
  cpf: string;
  qualificacao: string;
  tipo_qualificacao: string;
  eh_principal: string;
  expediente: string;
  parte_id?: string;
};

type SelectedItemsMap = {
  tribunal?: OptionItem;
  acao?: OptionItem;
  assunto?: OptionItem;
  orgao_origem?: OptionItem;
  orgao_julgador?: OptionItem;
};

type FormShape = {
  // Dados Básicos
  area_atuacao: string;
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
  // Partes
  partes: ParteItem[];
  // Distribuição
  tipo_distribuicao: string;
  motivo_distribuicao: string;
  procurador_responsavel_id: string;
  incidencia?: string;
  referencia_numero_processo?: string;
  
  // --- Novos Campos de Andamento ---
  adicionar_andamento_inicial: boolean; // Flag para controlar se envia ou não
  andamento_descricao: string;
  andamento_tipo: string;
  andamento_movimentacao: string;
  andamento_data_prazo: string;
  andamento_data_ciencia: string;
  andamento_status: string;
  andamento_procurador_id: string;
  andamento_assessor_id: string;
};

// --- Constantes Estáticas ---
const AREAS_ATUACAO = [
  { id: 'civel', nome: 'Cível' },
  { id: 'trabalhista', nome: 'Trabalhista' },
];

const EMPTY_OPTIONS: OptionItem[] = [];

const INSTANCIAS = [{ id: '1ª', nome: '1ª' }, { id: '2ª', nome: '2ª' }, { id: 'STJ', nome: 'STJ' }, { id: 'STF', nome: 'STF' }];
const TIPOS_PROCESSO = [{ id: 'Cível', nome: 'Cível' }, { id: 'Trabalhista', nome: 'Trabalhista' }, { id: 'Tributário', nome: 'Tributário' }, { id: 'Administrativo', nome: 'Administrativo' }, { id: 'Outros', nome: 'Outros' }];
const TIPO_PAGAMENTO_OPTIONS = [{ id: 'precatorio', nome: 'Precatório' }, { id: 'rpv', nome: 'RPV / Outro' }];
const QUALIFICACOES = [{ id: 'Pessoa Física', nome: 'Pessoa Física' }, { id: 'Pessoa Jurídica', nome: 'Pessoa Jurídica' }, { id: 'Entidade Pública', nome: 'Entidade Pública' }, { id: 'Outro', nome: 'Outro' }];
const TIPO_QUALIFICACAO = [{ id: 'Autor', nome: 'Autor' }, { id: 'Réu', nome: 'Réu' }, { id: 'Interessado', nome: 'Interessado' }, { id: 'Testemunha', nome: 'Testemunha' }, { id: 'Outro', nome: 'Outro' }];
const EXPEDIENTE_OPTIONS = [{ id: '1', nome: 'Sim' }, { id: '0', nome: 'Não' }];
const DIST_TYPES = [{ id: 'manual', nome: 'Manual' }, { id: 'automatica', nome: 'Automática' }, { id: 'equilibrada', nome: 'Equilibrada' }];
const DIST_MOTIVOS = [{ id: 'rotina', nome: 'Rotina' }, { id: 'urgencia', nome: 'Urgência' }, { id: 'competencia', nome: 'Competência' }, { id: 'sobrecarga', nome: 'Equilíbrio de carga' }];

// Constantes do Andamento
const TIPOS_ANDAMENTO = [
  { id: 'despacho', nome: 'Despacho' },
  { id: 'decisao', nome: 'Decisão' },
  { id: 'sentenca', nome: 'Sentença' },
  { id: 'certidao', nome: 'Certidão' },
  { id: 'peticao', nome: 'Petição' },
];

const TIPOS_MOVIMENTACAO = [
  { id: 'entrada', nome: 'Entrada' },
  { id: 'saida', nome: 'Saída' },
  { id: 'prazo', nome: 'Prazo' },
  { id: 'ciencia', nome: 'Ciência' },
];

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

const createEmptyParte = (idx: number): ParteItem => ({
  id: `p${Date.now()}-${idx}`,
  nome: '',
  cpf: '',
  qualificacao: 'Pessoa Física',
  tipo_qualificacao: 'Autor',
  eh_principal: '0',
  expediente: '0',
  parte_id: '',
});

export default function CadastroIndividual({
  procuradores = [],
  assessores = [], // Nova prop
  setorSelecionado = '',
  processo = undefined
}: {
  procuradores?: Procurador[];
  assessores?: Procurador[]; // Assumindo mesma estrutura de {id, nome}
  setorSelecionado?: string;
  processo?: ProcessoEditData;
}) {
  const isEditMode = !!processo;
  const [step, setStep] = useState<number>(0);
  // Adicionado o passo "Primeiro Andamento"
  const stepTitles = ['Dados básicos', 'Partes', 'Distribuição', 'Andamento'];
  
  const [isSearchOpen, setIsSearchOpen] = useState<Record<string, boolean>>({});

  const [selectedItems, setSelectedItems] = useState<SelectedItemsMap>(() => {
    if (processo) {
      return {
        tribunal: processo.tribunal ? { id: processo.tribunal.id, nome: processo.tribunal.nome } : undefined,
        acao: processo.acao ? { id: processo.acao.id, nome: processo.acao.nome } : undefined,
        assunto: processo.assunto ? { id: processo.assunto.id, nome: processo.assunto.nome } : undefined,
        orgao_origem: processo.orgao_origem ? { id: processo.orgao_origem.id, nome: processo.orgao_origem.nome } : undefined,
        orgao_julgador: processo.orgao_julgador ? { id: processo.orgao_julgador.id, nome: processo.orgao_julgador.nome } : undefined,
      };
    }
    return {};
  });

  const procuradoresOptions = useMemo(() => {
    return procuradores.map(p => ({ id: String(p.id), nome: p.nome }));
  }, [procuradores]);

  const assessoresOptions = useMemo(() => {
    return assessores.map(a => ({ id: String(a.id), nome: a.nome }));
  }, [assessores]);

  const { data, setData, post, put, processing, errors, reset } = useForm<FormShape>({
    area_atuacao: processo?.area_atuacao || setorSelecionado || '',
    instancia: processo?.instancia || '',
    tribunal: processo?.tribunal_id ? String(processo.tribunal_id) : '',
    valor_causa: processo?.valor_causa || '',
    numero_processo: processo?.cnj || '',
    tipo_processo: processo?.tipo_processo || '',
    tipo_pagamento: processo?.tipo_pagamento || '',
    acao: processo?.acao_id ? String(processo.acao_id) : '',
    assunto: processo?.assunto_id ? String(processo.assunto_id) : '',
    orgao_origem: processo?.orgao_origem_id ? String(processo.orgao_origem_id) : '',
    orgao_julgador: processo?.orgao_julgador_id ? String(processo.orgao_julgador_id) : '',
    juizo_vara: '',
    numero_juizo_vara: '',
    numero_agravo: processo?.numero_agravo || '',
    numero_suspensao: processo?.numero_suspensao || '',
    numero_protocolo: processo?.numero_protocolo || '',

    partes: (processo?.partes && processo.partes.length > 0)
      ? processo.partes.map((p, idx) => ({
        id: `db_${p.id}_${idx}`,
        nome: p.nome,
        cpf: p.cpf_cnpj || '',
        qualificacao: p.pivot?.qualificacao || 'Pessoa Física',
        tipo_qualificacao: p.pivot?.tipo_qualificacao || 'Autor',
        eh_principal: p.pivot?.parte_principal ? '1' : '0',
        expediente: p.pivot?.expediente ? '1' : '0',
        parte_id: String(p.id)
      }))
      : [createEmptyParte(0)],

    tipo_distribuicao: processo?.tipo_distribuicao || '',
    motivo_distribuicao: processo?.motivo_distribuicao || '',
    procurador_responsavel_id: processo?.procurador_responsavel_id ? String(processo.procurador_responsavel_id) : '',
    incidencia: processo?.processo_ref_id ? '1' : '0',
    referencia_numero_processo: '',

    // Init andamento fields
    adicionar_andamento_inicial: true,
    andamento_descricao: '',
    andamento_tipo: '',
    andamento_movimentacao: '',
    andamento_data_prazo: '',
    andamento_data_ciencia: '',
    andamento_status: 'aberto',
    andamento_procurador_id: '',
    andamento_assessor_id: ''
  });

  // Efeito para preencher o procurador do andamento automaticamente quando selecionado na distribuição
  useEffect(() => {
    if (data.procurador_responsavel_id && !data.andamento_procurador_id) {
      setData('andamento_procurador_id', data.procurador_responsavel_id);
    }
  }, [data.procurador_responsavel_id]);

  const searchTribunais = useCallback(async (query: string) => {
    try { const r = await fetch(`/api/tribunais?search=${encodeURIComponent(query)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; }
  }, []);

  const searchAcoes = useCallback(async (query: string) => {
    try { const r = await fetch(`/api/acoes?search=${encodeURIComponent(query)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; }
  }, []);

  const searchAssuntos = useCallback(async (query: string) => {
    try { const r = await fetch(`/api/assuntos?search=${encodeURIComponent(query)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; }
  }, []);

  const searchOrgaoOrigem = useCallback(async (query: string) => {
    try { const r = await fetch(`/api/orgao-origem?search=${encodeURIComponent(query)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; }
  }, []);

  const searchOrgaoJulgador = useCallback(async (query: string) => {
    try { const r = await fetch(`/api/orgao-julgador?search=${encodeURIComponent(query)}`); return r.ok ? (await r.json()).data || [] : []; } catch { return []; }
  }, []);

  const searchPartes = useCallback(async (q: string) => {
    try {
      if ((q || '').trim().length < 3) return [];
      const res = await fetch(`/api/partes-existentes?search=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const json = await res.json();
      const dados = (json.data || []) as ParteApiResponse[];
      return dados.map((d) => ({
        id: String(d.id),
        nome: d.nome,
        cpf: d.cpf || d.cpf_cnpj || '',
        tipo_parte: d.tipo_parte,
        qualificacao: d.qualificacao || 'Pessoa Física'
      }));
    } catch (e) { console.error(e); return []; }
  }, []);

  const searchProcuradores = useCallback(async (q: string) => {
    try { return procuradores.filter(p => p.nome.toLowerCase().includes(q.toLowerCase())).map(p => ({ id: String(p.id), nome: p.nome })); } catch { return []; }
  }, [procuradores]);

  const searchAssessores = useCallback(async (q: string) => {
    try { return assessores.filter(a => a.nome.toLowerCase().includes(q.toLowerCase())).map(a => ({ id: String(a.id), nome: a.nome })); } catch { return []; }
  }, [assessores]);

  const handleSetorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoValor = e.target.value;
    setData('area_atuacao', novoValor);
    router.post('/processos/set-setor', { setor: novoValor }, { preserveState: true, preserveScroll: true });
  };

  function getErrorByPath(path: string): string | undefined {
    const errs = errors as Record<string, string | undefined>;
    return errs[path];
  }

  function addParte() { setData('partes', [...data.partes, createEmptyParte(data.partes.length)]); }
  function removeParte(idToRemove: string) { if (data.partes.length <= 1) return; setData('partes', data.partes.filter((p) => p.id !== idToRemove)); }

  function updateParte(idToUpdate: string, updates: Partial<ParteItem> | keyof ParteItem, value?: string) {
    if (typeof updates === 'string' && value !== undefined) {
      setData('partes', data.partes.map((p) => (p.id === idToUpdate ? { ...p, [updates]: value } : p)));
    } else if (typeof updates === 'object') {
      setData('partes', data.partes.map((p) => (p.id === idToUpdate ? { ...p, ...updates } : p)));
    }
  }

  function canProceedFromStep(current: number): boolean {
    if (current === 0) return Boolean((data.assunto || data.numero_processo) && data.area_atuacao);
    if (current === 1) return data.partes.length > 0 && data.partes.every((p) => p.nome && p.nome.trim() !== '');
    if (current === 2) return Boolean(data.tipo_distribuicao && data.procurador_responsavel_id); // Validação básica da distribuição
    return true;
  }

  // Aumentado o limite para 3 (4 passos: 0, 1, 2, 3)
  function next() { if (!canProceedFromStep(step)) return; setStep((s) => Math.min(3, s + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function prev() { setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function formatCNJInput(raw?: string) { if (!raw) return ''; return String(raw).replace(/\D/g, '').slice(0, 20).replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/, "$1-$2.$3.$4.$5.$6"); }
  function handleNumeroProcessoChange(e: ChangeEvent<HTMLInputElement>) { setData('numero_processo', formatCNJInput(e.target.value)); }
  function handleNumeroProcessoPaste(e: React.ClipboardEvent<HTMLInputElement>) { e.preventDefault(); setData('numero_processo', formatCNJInput(e.clipboardData.getData('text'))); }

  function handleValorCausaChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if (value === "") { setData('valor_causa', ""); return; }
    const numberValue = parseFloat(value) / 100;
    setData('valor_causa', numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  function formatCPFInput(raw?: string) {
    if (!raw) return '';
    const d = String(raw).replace(/\D/g, '').slice(0, 14);
    return d.length <= 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  function handleParteCPFChange(id: string, value: string) { updateParte(id, { cpf: formatCPFInput(value) }); }

  function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditMode) put(`/processos/${processo!.id}`, { preserveScroll: true });
    else post('/processos', { preserveScroll: true, onSuccess: () => { const s = data.area_atuacao; setStep(0); reset(); setData('area_atuacao', s); router.get('/processos/novo', {}, { replace: true }); } });
  }

  function StepDot({ i }: { i: number }) {
    const active = i === step; const done = i < step;
    return (
      <div className="flex flex-col items-center gap-1.5 relative">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-(--brand-600) border-(--brand-600) text-white' : active ? 'bg-(--surface-card) border-(--brand-600) text-(--brand-600) shadow-lg scale-110' : 'bg-(--surface-muted) border-(--gpdl-border) text-(--text-muted)'}`}>
          {done ? <Check className="h-4 w-4" /> : i + 1}
        </div>
        <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: active ? 'var(--text-strong)' : 'var(--text-muted)' }}>{stepTitles[i]}</div>
      </div>
    );
  }

  const sectionHeaderClass = "flex items-center gap-3 mb-5 border-b pb-3";
  const iconBoxClass = "p-2 rounded-lg text-white shadow-md";

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Processos', href: '/processos/ativos' }, { title: isEditMode ? 'Editar' : 'Cadastro', href: '#' }]}>
      <Head title={isEditMode ? "Editar Processo" : "Cadastro"} />

      <div className="mt-4 pb-8 w-full px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-strong)' }}>{isEditMode ? `Editando: ${processo?.cnj || 'Processo'}` : 'Cadastrar processo'}</h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-(--text-muted)">Área de Atuação:</span>
              <select value={data.area_atuacao} onChange={handleSetorChange} className="text-sm rounded-md border-0 ring-1 ring-(--gpdl-border) py-1 pl-2 pr-8 bg-(--surface-muted) font-semibold text-(--text-strong) focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="" disabled>Selecione...</option>
                {AREAS_ATUACAO.map((s) => (<option key={s.id} value={s.id}>{s.nome}</option>))}
              </select>
              <InputError message={errors.area_atuacao} />
            </div>
          </div>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium hover:shadow-sm" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-card)', color: 'var(--text-strong)' }}><ArrowRight className="h-3.5 w-3.5 rotate-180" /> Voltar</button>
        </div>

        <div className="mb-8 relative mx-4 md:mx-0">
          <div className="absolute top-4 left-0 w-full h-0.5 rounded-full opacity-30" style={{ background: 'var(--gpdl-border)' }} />
          {/* Ajustado cálculo de porcentagem para 4 steps (divide por 3) */}
          <div className="absolute top-4 left-0 h-0.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%`, backgroundColor: 'var(--brand-600)' }} />
          <div className="flex justify-between w-full relative z-10">{[0, 1, 2, 3].map((i) => (<div key={i} className="flex-1 flex justify-center first:justify-start last:justify-end"><StepDot i={i} /></div>))}</div>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* ETAPA 1: DADOS BÁSICOS */}
          {step === 0 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}><div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}><Scale className="h-5 w-5" /></div><h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Dados básicos</h3></div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-2"><CustomSelect label="Instância" value={data.instancia} onChange={(e) => setData('instancia', e.target.value)} options={INSTANCIAS} error={getErrorByPath('instancia')} placeholder="-" /></div>
                <div className="md:col-span-7">
                  <Label>Tribunal</Label>
                  <AutocompleteSearch
                    placeholder="Buscar tribunal..."
                    value={data.tribunal}
                    onChange={(v) => setData('tribunal', String(v))}
                    options={selectedItems.tribunal ? [selectedItems.tribunal] : EMPTY_OPTIONS}
                    onSearch={searchTribunais}
                    onSelectOption={(item) => {
                      if (item) setSelectedItems(prev => ({ ...prev, tribunal: item as OptionItem }));
                      setData('tribunal', item ? String(item.id) : '');
                    }}
                    error={getErrorByPath('tribunal')}
                  />
                </div>
                <div className="md:col-span-3"><Label>Valor da causa</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50" style={{ color: 'var(--text-muted)' }}>R$</span><input className={`${INPUT_BASE_CLASS} pl-8 font-medium`} value={data.valor_causa} onChange={handleValorCausaChange} placeholder="0,00" maxLength={25} /></div></div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-8"><Label>Número do processo (CNJ)</Label><input className={`${INPUT_BASE_CLASS} font-mono tracking-wide`} value={data.numero_processo} onChange={handleNumeroProcessoChange} onPaste={handleNumeroProcessoPaste} placeholder="0000000-00.0000.0.00.0000" /><InputError message={getErrorByPath('numero_processo')} className="mt-1" /></div>
                <div className="md:col-span-4"><CustomSelect label="Tipo de processo" value={data.tipo_processo} onChange={(e) => setData('tipo_processo', e.target.value)} options={TIPOS_PROCESSO} error={getErrorByPath('tipo_processo')} /></div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><CustomSelect label="Tipo de pagamento" placeholder="Indeterminado" value={data.tipo_pagamento} onChange={(e) => setData('tipo_pagamento', e.target.value)} options={TIPO_PAGAMENTO_OPTIONS} /></div>
                <div>
                  <Label>Ação</Label>
                  <AutocompleteSearch
                    placeholder="Buscar ação..."
                    value={data.acao}
                    onChange={(v) => setData('acao', String(v))}
                    options={selectedItems.acao ? [selectedItems.acao] : EMPTY_OPTIONS}
                    onSearch={searchAcoes}
                    onSelectOption={(item) => {
                      if (item) setSelectedItems(prev => ({ ...prev, acao: item as OptionItem }));
                      setData('acao', item ? String(item.id) : '');
                    }}
                    error={getErrorByPath('acao')}
                  />
                </div>
                <div>
                  <Label>Assunto</Label>
                  <AutocompleteSearch
                    placeholder="Buscar assunto..."
                    value={data.assunto}
                    onChange={(v) => setData('assunto', String(v))}
                    options={selectedItems.assunto ? [selectedItems.assunto] : EMPTY_OPTIONS}
                    onSearch={searchAssuntos}
                    onSelectOption={(item) => {
                      if (item) setSelectedItems(prev => ({ ...prev, assunto: item as OptionItem }));
                      setData('assunto', item ? String(item.id) : '');
                    }}
                    error={getErrorByPath('assunto')}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Órgão de origem</Label>
                  <AutocompleteSearch
                    placeholder="Buscar..."
                    value={data.orgao_origem}
                    onChange={(v) => setData('orgao_origem', String(v))}
                    options={selectedItems.orgao_origem ? [selectedItems.orgao_origem] : EMPTY_OPTIONS}
                    onSearch={searchOrgaoOrigem}
                    onSelectOption={(item) => {
                      if (item) setSelectedItems(prev => ({ ...prev, orgao_origem: item as OptionItem }));
                      setData('orgao_origem', item ? String(item.id) : '');
                    }}
                  />
                </div>
                <div>
                  <Label>Órgão julgador</Label>
                  <AutocompleteSearch
                    placeholder="Buscar..."
                    value={data.orgao_julgador}
                    onChange={(v) => setData('orgao_julgador', String(v))}
                    options={selectedItems.orgao_julgador ? [selectedItems.orgao_julgador] : EMPTY_OPTIONS}
                    onSearch={searchOrgaoJulgador}
                    onSelectOption={(item) => {
                      if (item) setSelectedItems(prev => ({ ...prev, orgao_julgador: item as OptionItem }));
                      setData('orgao_julgador', item ? String(item.id) : '');
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border bg-opacity-50" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)' }}>
                <div className="mb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-strong)' }}><Info className="w-3.5 h-3.5 text-(--brand-500)" /> Números Adicionais</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><Label>Agravo</Label><input className={INPUT_BASE_CLASS} value={data.numero_agravo} onChange={(e) => setData('numero_agravo', e.target.value)} /></div>
                  <div><Label>Suspensão</Label><input className={INPUT_BASE_CLASS} value={data.numero_suspensao} onChange={(e) => setData('numero_suspensao', e.target.value)} /></div>
                  <div><Label>Protocolo</Label><input className={INPUT_BASE_CLASS} value={data.numero_protocolo} onChange={(e) => setData('numero_protocolo', e.target.value)} /></div>
                </div>
              </div>

              <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <label className="inline-flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-(--surface-muted) transition-colors"><input type="checkbox" className="w-4 h-4 rounded border-gray-400 text-(--brand-600)" checked={data.incidencia === '1'} onChange={(e) => setData('incidencia', e.target.checked ? '1' : '0')} /><span className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Processo é incidente?</span></label>
                {data.incidencia === '1' && (<div className="mt-3 pl-4 border-l-4 ml-2" style={{ borderColor: 'var(--brand-600)' }}><Label>Número CNJ Referenciado</Label><input className={`${INPUT_BASE_CLASS} font-mono max-w-sm`} value={data.referencia_numero_processo} onChange={(e) => setData('referencia_numero_processo', formatCNJInput(e.target.value))} placeholder="0000000-00.0000.0.00.0000" /></div>)}
              </div>

              <div className="mt-8 flex justify-end border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}><button type="button" onClick={next} disabled={!canProceedFromStep(0) || processing} className={`btn-gradient rounded-lg px-6 py-2.5 text-sm font-semibold flex items-center gap-2 text-white shadow-md ${!canProceedFromStep(0) ? 'opacity-50' : ''}`}>Próximo <ArrowRight className="h-4 w-4" /></button></div>
            </section>
          )}

          {/* ETAPA 2: PARTES */}
          {step === 1 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}><div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}><Users className="h-5 w-5" /></div><h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Partes envolvidas</h3></div>
              <div className="space-y-4">
                {data.partes.map((par, idx) => (
                  <div key={par.id} className="rounded-xl border p-4 relative hover:shadow-sm transition-shadow" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-muted)' }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                      <div className="md:col-span-6">
                        <Label>Nome</Label>
                        <div className="relative">
                          {!isSearchOpen[par.id] ? (
                            <div className="flex">
                              <div className="flex-grow">
                                <AutocompleteSearch
                                  placeholder="Buscar parte existente..."
                                  value={par.parte_id || null}
                                  onChange={(v) => {
                                    updateParte(par.id, { parte_id: String(v || '') });
                                  }}
                                  onSelectOption={(opt: any) => {
                                    if (opt) {
                                      updateParte(par.id, {
                                        nome: opt.nome || '',
                                        cpf: formatCPFInput(opt.cpf || opt.cpf_cnpj || ''),
                                        qualificacao: opt.qualificacao || 'Pessoa Física',
                                        tipo_qualificacao: opt.tipo_parte || 'Autor',
                                        parte_id: String(opt.id),
                                      });
                                    } else {
                                      updateParte(par.id, { nome: '', cpf: '', parte_id: '' });
                                    }
                                  }}
                                  onSearch={searchPartes}
                                  options={par.parte_id && par.nome ? [{ id: par.parte_id, nome: par.nome }] : []}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateParte(par.id, { parte_id: '' });
                                  setIsSearchOpen(prev => ({ ...prev, [par.id]: true }))
                                }}
                                className="px-3 text-sm flex items-center gap-1.5 transition-colors rounded-lg ml-2"
                                style={{ background: 'var(--surface-main)', color: 'var(--brand-600)', border: '1px solid var(--gpdl-border)', borderLeft: 'none' }}
                              >
                                <UserPlus className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase hidden sm:inline">Criar Novo</span>
                              </button>
                            </div>

                          ) : (
                            <div className="relative">
                              <input
                                className={`${INPUT_BASE_CLASS} pr-10`}
                                placeholder="Digite o nome da parte (criação manual)..."
                                value={par.nome}
                                onChange={(e) => updateParte(par.id, { nome: e.target.value, parte_id: '' })}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSearchOpen(prev => ({ ...prev, [par.id]: false }))
                                }}
                                className="absolute right-0 top-0 h-full px-3 text-sm flex items-center gap-1.5 transition-colors rounded-r-lg"
                                style={{ background: 'var(--surface-main)', color: 'var(--red-500)', borderLeft: '1px solid var(--gpdl-border)' }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <InputError message={getErrorByPath(`partes.${idx}.nome`)} className="mt-1" />
                      </div>

                      <div className="md:col-span-6"><Label>CPF/CNPJ</Label><input className={`${INPUT_BASE_CLASS} font-mono`} value={par.cpf} onChange={(e) => handleParteCPFChange(par.id, e.target.value)} placeholder="000.000.000-00" /></div>

                      <div className="md:col-span-12 flex flex-col md:flex-row items-center gap-6 border-t border-dashed pt-3" style={{ borderColor: 'var(--gpdl-border)' }}>
                        <div className="flex gap-4 w-full md:w-auto">
                          <div className="w-1/2"><CustomSelect label="Qualificação" value={par.qualificacao} onChange={(e) => updateParte(par.id, { qualificacao: e.target.value })} options={QUALIFICACOES} /></div>
                          <div className="w-1/2"><CustomSelect label="Tipo" value={par.tipo_qualificacao} onChange={(e) => updateParte(par.id, { tipo_qualificacao: e.target.value })} options={TIPO_QUALIFICACAO} /></div>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                          <CustomSelect label="Principal?" value={par.eh_principal} onChange={(e) => updateParte(par.id, { eh_principal: e.target.value })} options={[{ id: '0', nome: 'Não' }, { id: '1', nome: 'Sim' }]} />
                          <CustomSelect label="Expediente?" value={par.expediente} onChange={(e) => updateParte(par.id, { expediente: e.target.value })} options={EXPEDIENTE_OPTIONS} />
                        </div>

                        <div className="ml-auto"><button type="button" onClick={() => removeParte(par.id)} disabled={data.partes.length <= 1} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 text-xs font-bold uppercase"><Trash2 className="h-3.5 w-3.5" /> Remover</button></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <button type="button" onClick={addParte} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110" style={{ color: 'var(--brand-700)', backgroundColor: 'var(--accent-info-soft)', border: '1px solid var(--accent-info-border)' }}><UserPlus className="h-4 w-4" /> Adicionar parte</button>
                <div className="flex gap-3">
                  <button type="button" onClick={prev} className="px-5 py-2 rounded-lg border text-sm font-medium hover:shadow-sm" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)', color: 'var(--text-strong)' }}>Voltar</button>
                  <button type="button" onClick={next} disabled={!canProceedFromStep(1)} className={`btn-gradient rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-md ${!canProceedFromStep(1) ? 'opacity-50' : ''}`}>Próximo <ArrowRight className="h-4 w-4 inline-block ml-1" /></button>
                </div>
              </div>
            </section>
          )}

          {/* ETAPA 3: DISTRIBUIÇÃO */}
          {step === 2 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}><div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}><Calculator className="h-5 w-5" /></div><h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Distribuição</h3></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><CustomSelect label="Tipo" value={data.tipo_distribuicao} onChange={(e) => setData('tipo_distribuicao', e.target.value)} options={DIST_TYPES} error={getErrorByPath('tipo_distribuicao')} /></div>
                <div className="md:col-span-2"><CustomSelect label="Motivo (Opcional)" placeholder="Nenhum" value={data.motivo_distribuicao} onChange={(e) => setData('motivo_distribuicao', e.target.value)} options={DIST_MOTIVOS} /></div>
              </div>
              <div className="mt-5">
                <Label>Procurador Responsável</Label>
                <div className="w-full">
                  <AutocompleteSearch
                    placeholder="Selecione um procurador"
                    value={data.procurador_responsavel_id}
                    onChange={(val) => setData('procurador_responsavel_id', String(val))}
                    onSearch={searchProcuradores}
                    options={procuradoresOptions}
                    error={getErrorByPath('procurador_responsavel_id')}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <button type="button" onClick={prev} className="px-5 py-2 rounded-lg border text-sm font-medium hover:shadow-sm" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)', color: 'var(--text-strong)' }}>Voltar</button>
                
                {/* Botão agora é Próximo, pois há uma etapa nova */}
                <button type="button" onClick={next} disabled={!canProceedFromStep(2)} className={`btn-gradient rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-md flex items-center gap-2 ${!canProceedFromStep(2) ? 'opacity-50' : ''}`}>
                  Próximo <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          )}

          {/* ETAPA 4: PRIMEIRO ANDAMENTO (NOVO) */}
          {step === 3 && (
            <section className="gpdl-card p-6 animate-fadeIn">
              <div className={sectionHeaderClass} style={{ borderColor: 'var(--gpdl-border)' }}>
                <div className={iconBoxClass} style={{ backgroundColor: 'var(--brand-600)' }}>
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-strong)' }}>Primeiro Andamento</h3>
              </div>
              
              <div className="mb-6 bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                 <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                 <p className="text-sm text-blue-700">Este andamento será criado automaticamente vinculado a este novo processo. O "Processo" é o que você está acabando de criar.</p>
              </div>

              <div>
                <Label>Descrição do andamento</Label>
                <textarea
                  className={`${INPUT_BASE_CLASS} min-h-[100px]`}
                  value={data.andamento_descricao}
                  onChange={(e) => setData('andamento_descricao', e.target.value)}
                  placeholder="Descreva o andamento processual inicial..."
                />
                <InputError message={getErrorByPath('andamento_descricao')} className="mt-1" />
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Tipo de andamento</Label>
                  <AutocompleteSearch
                    placeholder="Selecione..."
                    value={data.andamento_tipo}
                    onChange={(v) => setData('andamento_tipo', String(v))}
                    options={TIPOS_ANDAMENTO}
                    onSearch={async (q) => TIPOS_ANDAMENTO.filter(t => t.nome.toLowerCase().includes(q.toLowerCase()))}
                  />
                  <InputError message={getErrorByPath('andamento_tipo')} />
                </div>
                <div>
                  <Label>Tipo de movimentação</Label>
                  <AutocompleteSearch
                    placeholder="Selecione..."
                    value={data.andamento_movimentacao}
                    onChange={(v) => setData('andamento_movimentacao', String(v))}
                    options={TIPOS_MOVIMENTACAO}
                    onSearch={async (q) => TIPOS_MOVIMENTACAO.filter(t => t.nome.toLowerCase().includes(q.toLowerCase()))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Status</Label>
                  <select className={INPUT_BASE_CLASS} value={data.andamento_status} onChange={(e) => setData('andamento_status', e.target.value)}>
                    <option value="aberto">Aberto</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label><Flag className="inline h-3 w-3 mr-1" /> Data do prazo</Label>
                  <input type="date" className={INPUT_BASE_CLASS} value={data.andamento_data_prazo} onChange={(e) => setData('andamento_data_prazo', e.target.value)} />
                </div>
                <div>
                  <Label>Data da ciência</Label>
                  <input type="date" className={INPUT_BASE_CLASS} value={data.andamento_data_ciencia} onChange={(e) => setData('andamento_data_ciencia', e.target.value)} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label><User className="inline h-3 w-3 mr-1" /> Procurador responsável</Label>
                  <AutocompleteSearch
                    placeholder="Selecione um procurador"
                    value={data.andamento_procurador_id}
                    onChange={(val) => setData('andamento_procurador_id', String(val))}
                    onSearch={searchProcuradores}
                    options={procuradoresOptions}
                  />
                </div>
                <div>
                  <Label><User className="inline h-3 w-3 mr-1" /> Assessor responsável</Label>
                  <AutocompleteSearch
                    placeholder="Selecione um assessor"
                    value={data.andamento_assessor_id}
                    onChange={(val) => setData('andamento_assessor_id', String(val))}
                    onSearch={searchAssessores}
                    options={assessoresOptions}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between border-t pt-5" style={{ borderColor: 'var(--gpdl-border)' }}>
                <button type="button" onClick={prev} className="px-5 py-2 rounded-lg border text-sm font-medium hover:shadow-sm" style={{ borderColor: 'var(--gpdl-border)', backgroundColor: 'var(--surface-muted)', color: 'var(--text-strong)' }}>Voltar</button>
                <button type="submit" disabled={processing} className="btn-gradient rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-70 flex items-center gap-2">
                  {processing ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Processo')}
                  {isEditMode ? <Pencil className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </button>
              </div>
            </section>
          )}

        </form>
      </div>
    </GPDLLayout>
  );
}