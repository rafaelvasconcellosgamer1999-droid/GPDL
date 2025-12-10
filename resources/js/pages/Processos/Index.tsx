// resources/js/Pages/Processos/Index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';

// Views
import CadastroView from './views/Cadastro';
import AtivosView from './views/Ativos';
import PendentesView from './views/Pendentes';
import VencidosView from './views/Vencidos';
import DistribuicaoView from './views/Distribuicao';
import EncerradosView from './views/Encerrados';

// Shared types
const views = [
  'cadastro',
  'ativos',
  'pendentes',
  'vencidos',
  'distribuicao',
  'encerrados',
] as const;
type View = (typeof views)[number];

export type Procurador = { id: number; nome: string };
export type OptionItem = { id: string | number; nome: string };

export interface ProcessoRow {
  id: number;
  orgao?: string | null;
  acao?: string | null;
  numero?: string | null;
  assunto?: string | null;
  vara_juizo?: string | null;
  partes_envolvidas?: string | null;
  data_limite?: string | null;
  data_ciencia?: string | null;
  ultimo_mov_texto?: string | null;
  responsavel_nome?: string | null;
}

export interface Paginator<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from?: number;
  to?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

export interface FiltersForm {
  responsavel_id: string;
  order: string;
  per_page: string;
  view?: View;
}

/**
 * Tipagem do objeto page.props vindo do Inertia.
 * Adicione aqui as propriedades que o backend retorna (ex.: tribunais, acoes, orgaos, setores).
 */
interface PageProps extends Record<string, unknown> {
  processos?: Paginator<ProcessoRow>;
  flash?: { success?: string; error?: string };
  filters?: FiltersForm;
  procuradores?: Procurador[];
  setorSelecionado?: string;
  setores?: { id: string; nome: string }[];
  tribunais?: OptionItem[];
  acoes?: OptionItem[];
  orgaos?: OptionItem[];
  orgaosJulgadores?: OptionItem[];
}

export default function ProcessosIndex({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  // Inertia page props (tipado corretamente)
  const page = usePage<PageProps>();
  const processos = page.props?.processos;
  const flashSuccess = page.props?.flash?.success;
  const flashError = page.props?.flash?.error;
  const backendFilters = page.props?.filters;

  // setores (opcional) — caso o backend envie uma lista de setores use-a; caso contrário fallback hardcoded
  const setoresFromBackend = page.props?.setores;
  const DEFAULT_SETORS = [
    { id: 'contencioso', nome: 'Contencioso' },
    { id: 'previdencia', nome: 'Previdência' },
    { id: 'administrativo', nome: 'Administrativo' },
    { id: 'tributario', nome: 'Tributário' },
  ];
  const setores = setoresFromBackend && setoresFromBackend.length > 0 ? setoresFromBackend : DEFAULT_SETORS;

  // initial setor: from server session (page.props.setorSelecionado) or localStorage fallback
  const initialSetor =
    (page.props?.setorSelecionado as string | undefined) ??
    (typeof window !== 'undefined' ? localStorage.getItem('setorSelecionado') ?? '' : '');

  const [setorSelecionado, setSetorSelecionado] = useState<string>(initialSetor);

  // derive current view preferring backend filters, falling back to query string
  const currentView: View = useMemo(() => {
    const backendView = (backendFilters?.view as View | undefined) ?? undefined;
    if (backendView && (views as readonly string[]).includes(backendView)) return backendView;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = (params.get('view') || 'ativos').toLowerCase();
      if ((views as readonly string[]).includes(v)) return v as View;
    }
    return 'ativos';
  }, [backendFilters?.view]);

  const [flashSuccessLocal, setFlashSuccessLocal] = useState<string>('');
  const [flashErrorLocal, setFlashErrorLocal] = useState<string>('');

  useEffect(() => {
    if (!flashSuccess) return;
    const sync = setTimeout(() => setFlashSuccessLocal(flashSuccess), 0);
    const id = setTimeout(() => setFlashSuccessLocal(''), 5000);
    return () => {
      clearTimeout(sync);
      clearTimeout(id);
    };
  }, [flashSuccess]);

  useEffect(() => {
    if (!flashError) return;
    const sync = setTimeout(() => setFlashErrorLocal(flashError), 0);
    const id = setTimeout(() => setFlashErrorLocal(''), 6000);
    return () => {
      clearTimeout(sync);
      clearTimeout(id);
    };
  }, [flashError]);

  // auto-refresh for prazo lists
  useEffect(() => {
    if (!['ativos', 'vencidos'].includes(currentView)) return;
    const id = setInterval(() => {
      if (typeof window !== 'undefined') {
        router.get(window.location.pathname + window.location.search, {}, { preserveState: true, preserveScroll: true, replace: true });
      }
    }, 15000);
    return () => clearInterval(id);
  }, [currentView]);

  const filters: FiltersForm = (backendFilters || {
    responsavel_id: '',
    order: 'prazo_asc',
    per_page: '10',
  }) as FiltersForm;

  const { data: f, setData: setF } = useForm<FiltersForm>({
    responsavel_id: String(filters.responsavel_id || ''),
    order: String(filters.order || 'prazo_asc'),
    per_page: String(filters.per_page || '10'),
    view: (filters.view as View) || currentView,
  });

  useEffect(() => {
    if (!filters) return;
    setF((prev) => {
      return {
        responsavel_id: String(filters.responsavel_id ?? prev.responsavel_id ?? ''),
        order: String(filters.order ?? prev.order ?? 'prazo_asc'),
        per_page: String(filters.per_page ?? prev.per_page ?? '10'),
        view: (filters.view as View) || prev.view || currentView,
      } as FiltersForm;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.responsavel_id, filters?.order, filters?.per_page, filters?.view]);

  const breadcrumb = [{ title: 'Processos', href: '/processos' }];
  const [finalizingId, setFinalizingId] = useState<number | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  function finalizeOne(id: number) {
    setFinalizingId(id);
    router.post(`/processos/${id}/finalizar`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setLocalError('');
        setLocalSuccess('Processo finalizado com sucesso.');
        setTimeout(() => setLocalSuccess(''), 4000);
      },
      onError: () => {
        setLocalSuccess('');
        setLocalError('Nao foi possivel finalizar o processo.');
        setTimeout(() => setLocalError(''), 4000);
      },
      onFinish: () => setFinalizingId(null),
    });
  }

  function applyFilters() {
    const q = new URLSearchParams();
    q.set('view', String(f.view || currentView));

    if (f.responsavel_id && f.responsavel_id.trim() !== '') {
      q.set('responsavel_id', f.responsavel_id);
    } else {
      q.delete('responsavel_id');
    }

    if (f.order) q.set('order', f.order);
    if (f.per_page) q.set('per_page', f.per_page);

    router.get(`/processos?${q.toString()}`, {}, {
      preserveScroll: true,
      preserveState: false,
      replace: true,
    });
  }

  function clearFilters() {
    setF('responsavel_id', '');
    setF('order', 'prazo_asc');
    setF('per_page', '10');
    setF('view', 'ativos' as View);

    router.get(`/processos?view=ativos`, {}, {
      preserveScroll: true,
      preserveState: false,
      replace: true,
    });
  }

  // Persistir setor selecionado (salva em session via route no backend e localStorage)
  async function persistSetor(setorId: string) {
    // persist instantaneamente na UI/localStorage
    setSetorSelecionado(setorId);
    if (typeof window !== 'undefined') localStorage.setItem('setorSelecionado', setorId);

    try {
      // usa Inertia router.post para integrar com sessão/CSRF/cookies
      await router.post('/processos/set-setor', { setor: setorId }, {
        preserveState: true,
        onError: (err) => {
          console.error('Falha ao persistir setor no servidor (inertia):', err);
        },
      });
    } catch (err) {
      console.error('Erro ao persistir setor (router.post):', err);
    }
  }

  return (
    <GPDLLayout breadcrumbs={breadcrumb}>
      <Head title={`Processos - ${currentView}`} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-strong)' }}>Processos</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Central de cadastros e acompanhamento</p>
        </div>

        {/* selector de setor (apenas na UI; chama persistSetor para salvar) */}
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Área de atuação</label>
          <select value={setorSelecionado} onChange={(e) => persistSetor(e.target.value)} className="gpdl-input-contrast px-3 py-2 rounded-md">
            <option value="">Selecione</option>
            {setores.map((s) => <option key={s.id} value={String(s.id)}>{s.nome}</option>)}
          </select>
        </div>
      </div>

      {(flashSuccessLocal || localSuccess) && (
        <Alert variant="success" className="relative mt-3">
          <AlertDescription>{localSuccess || flashSuccessLocal}</AlertDescription>
          <button type="button" onClick={() => { setLocalSuccess(''); setFlashSuccessLocal(''); }} className="absolute top-2 right-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
        </Alert>
      )}

      {(flashErrorLocal || localError) && (
        <Alert variant="destructive" className="relative mt-3">
          <AlertDescription>{localError || flashErrorLocal}</AlertDescription>
        </Alert>
      )}

      {/* Cadastro view separated */}
      {currentView === 'cadastro' && (() => {
        const setorNome =
          setores.find((s) => String(s.id) === String(setorSelecionado))?.nome ?? '';

        return (
          <CadastroView
            setorSelecionado={setorNome}
            procuradores={page.props?.procuradores ?? procuradores}
            tribunais={page.props?.tribunais ?? []}
            acoes={page.props?.acoes ?? []}
            orgaos={page.props?.orgaos ?? []}
            orgaosJulgadores={page.props?.orgaosJulgadores ?? []}
          />
        );
      })()}

      {/* route to the chosen view component */}
      {currentView === 'ativos' && (
        <AtivosView
          processos={processos}
          filtros={f}
          setF={setF}
          onApply={applyFilters}
          onClear={clearFilters}
          procuradores={page.props?.procuradores ?? procuradores}
          onFinalize={finalizeOne}
          finalizingId={finalizingId}
        />
      )}

      {currentView === 'pendentes' && (
        <PendentesView
          processos={processos}
          filtros={f}
          setF={setF}
          onApply={applyFilters}
          onClear={clearFilters}
          procuradores={page.props?.procuradores ?? procuradores}
        />
      )}

      {currentView === 'vencidos' && (
        <VencidosView
          processos={processos}
          filtros={f}
          setF={setF}
          onApply={applyFilters}
          onClear={clearFilters}
          procuradores={page.props?.procuradores ?? procuradores}
        />
      )}

      {currentView === 'distribuicao' && <DistribuicaoView processos={processos} />}

      {currentView === 'encerrados' && (
        <EncerradosView
          processos={processos}
          filtros={f}
          setF={setF}
          onApply={applyFilters}
          onClear={clearFilters}
          procuradores={page.props?.procuradores ?? procuradores}
        />
      )}
    </GPDLLayout>
  );
}
