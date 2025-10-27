import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eraser, Layers, Plus, User as UserIcon, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const views = [
    'cadastro',
    'ativos',
    'pendentes',
    'vencidos',
    'distribuicao',
    'encerrados',
] as const;
type View = (typeof views)[number];

interface Procurador {
    id: number;
    nome: string;
}
interface Paginator<T> {
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

// Tipagem das linhas de processo usadas na tabela
interface ProcessoRow {
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

// Filtros do topo das listas
interface FiltersForm {
    responsavel_id: string;
    order: string;
    per_page: string;
    view: View;
}

// Formulário de cadastro em lote
interface LoteForm {
    modelo: string;
    responsavel_id: string;
    assunto: string;
    texto: string;
}

export default function ProcessosIndex({
    procuradores = [] as Procurador[],
}: {
    procuradores?: Procurador[];
}) {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const currentView: View = useMemo(() => {
        const params = new URLSearchParams(search);
        const v = (params.get('view') || 'ativos').toLowerCase();
        return (views as readonly string[]).includes(v)
            ? (v as View)
            : 'ativos';
    }, [search]);

    const page = usePage<{
        processos?: Paginator<ProcessoRow>;
        flash?: { success?: string; error?: string };
        filters?: FiltersForm;
    }>();
    const processos: Paginator<ProcessoRow> | undefined =
        page?.props?.processos;
    const flashSuccess: string | undefined = page?.props?.flash?.success;
    const flashError: string | undefined = page?.props?.flash?.error;
    const filters: FiltersForm = (page?.props?.filters || {
        responsavel_id: '',
        order: 'prazo_asc',
        per_page: '10',
    }) as FiltersForm;
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
    // Auto-refresh for deadline lists to keep status updated
    useEffect(() => {
        if (!['ativos', 'vencidos'].includes(currentView)) return;
        const id = setInterval(() => {
            if (typeof window !== 'undefined') {
                router.get(
                    window.location.pathname + window.location.search,
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 15000);
        return () => clearInterval(id);
    }, [currentView]);

    const { data: f, setData: setF } = useForm<FiltersForm>({
        responsavel_id: String(filters.responsavel_id || ''),
        order: String(filters.order || 'prazo_asc'),
        per_page: String(filters.per_page || '10'),
        view: (filters.view as View) || currentView,
    });
    useEffect(() => {
  if (!filters) return;

  // 🚀 Só atualiza o form quando o backend envia algo diferente do estado atual
  setF((prev) => {
    const next = {
      responsavel_id: String(filters.responsavel_id ?? prev.responsavel_id ?? ''),
      order: String(filters.order ?? prev.order ?? 'prazo_asc'),
      per_page: String(filters.per_page ?? prev.per_page ?? '10'),
      view: (filters.view as View) || prev.view || currentView,
    };
    return next;
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filters?.responsavel_id, filters?.order, filters?.per_page, filters?.view]);

    // Cadastro em lote
    const loteRef = useRef<HTMLDivElement | null>(null);
    const [showLote, setShowLote] = useState(true);
    const {
        data: lf,
        setData: setLf,
        post,
        processing,
        errors,
        reset,
    } = useForm<LoteForm>({
        modelo: 'pje',
        responsavel_id: '',
        assunto: '',
        texto: '',
    });

    const breadcrumb = [{ title: 'Processos', href: '/processos' }];
    const [finalizingId, setFinalizingId] = useState<number | null>(null);

    const [localSuccess, setLocalSuccess] = useState<string>('');
    const [localError, setLocalError] = useState<string>('');

    function finalizeOne(id: number) {
        setFinalizingId(id);
        router.post(
            `/processos/${id}/finalizar`,
            {},
            {
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
            },
        );
    }

    function applyFilters() {
  const q = new URLSearchParams();
  q.set('view', String(f.view || currentView));

  if (f.responsavel_id && f.responsavel_id.trim() !== '') {
    q.set('responsavel_id', f.responsavel_id);
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

        router.get(
            `/processos?view=ativos`,
            {},
            {
                preserveScroll: true,
                preserveState: false, // 👈 ESSENCIAL
                replace: true,
            },
        );
    }

    return (
        <GPDLLayout breadcrumbs={breadcrumb}>
            <Head title={`Processos - ${currentView}`} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-strong)]">
                        Processos
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Central de cadastros e acompanhamento
                    </p>
                </div>
            </div>

            {(flashSuccessLocal || localSuccess) && (
                <Alert variant="success" className="relative mt-3">
                    <AlertDescription>
                        {localSuccess || flashSuccessLocal}
                    </AlertDescription>
                    <button
                        type="button"
                        onClick={() => {
                            setLocalSuccess('');
                            setFlashSuccessLocal('');
                        }}
                        className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </Alert>
            )}
            {/* Navegacao removida: comandos via sidebar */}
            {(flashErrorLocal || localError) && (
                <Alert variant="destructive" className="relative mt-3">
                    <AlertDescription>
                        {localError || flashErrorLocal}
                    </AlertDescription>
                </Alert>
            )}

            {/* Navega??o removida: comandos via sidebar */}

            {currentView === 'cadastro' && (
                <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text-strong)]">
                                    Central de cadastros
                                </h2>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Escolha o formato de cadastro ideal. A opção
                                    em lotes aceita diversas linhas de processos
                                    e aplica as mesmas regras de distribuição.
                                </p>
                            </div>
                            <span className="rounded-full border border-[var(--gpdl-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--text-muted)]">
                                Guia rapido
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setShowLote(false)}
                                className={`group rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-elevate)] p-5 text-left transition hover:border-[var(--brand-600)]/40 ${!showLote ? 'ring-1 ring-[var(--brand-600)]/40' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[var(--text-strong)]">
                                            Cadastro individual
                                        </div>
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            Inclua um processo por vez,
                                            validando os detalhes com atenção.
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px]">
                                        Em breve
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowLote(true);
                                    requestAnimationFrame(() =>
                                        loteRef.current?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        }),
                                    );
                                }}
                                className={`group rounded-2xl border border-[var(--gpdl-border)] bg-[var(--surface-elevate)] p-5 text-left transition hover:border-[var(--brand-600)]/40 ${showLote ? 'ring-1 ring-[var(--brand-600)]/40' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[var(--text-strong)]">
                                            Cadastro em lote
                                        </div>
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            Importe varios processos de uma
                                            unica vez copiando o conteudo da
                                            publicação.
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px]">
                                        <Zap className="h-3 w-3" />{' '}
                                        Produtividade
                                    </span>
                                </div>
                            </button>
                        </div>

                        {showLote && (
                            <div
                                ref={loteRef}
                                className="mt-6 rounded-xl border border-dashed border-[var(--gpdl-border)] bg-[var(--surface-elevate)] p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-[var(--text-strong)]">
                                            Importar processos em lotes
                                        </h3>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Defina o responsavel e cole o
                                            conteudo integral da publicação.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowLote(false)}
                                        className="flex items-center gap-1 rounded-full border border-[var(--gpdl-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs hover:border-[var(--brand-600)]/40"
                                    >
                                        <X className="h-3 w-3" /> Fechar painel
                                    </button>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        post('/processos/importar-lote', {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                reset('assunto', 'texto'),
                                        });
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Responsável
                                            </label>
                                            <select
                                                name="responsavel_id"
                                                value={lf.responsavel_id}
                                                onChange={(e) =>
                                                    setLf(
                                                        'responsavel_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className="gpdl-input-contrast px-3 py-2"
                                            >
                                                <option value="">
                                                    Selecione um procurador
                                                </option>
                                                {procuradores.map((p) => (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                    >
                                                        {p.nome}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                className="mt-1"
                                                message={errors.responsavel_id}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Assunto (opcional)
                                            </label>
                                            <input
                                                name="assunto"
                                                value={lf.assunto}
                                                onChange={(e) =>
                                                    setLf(
                                                        'assunto',
                                                        e.target.value,
                                                    )
                                                }
                                                className="gpdl-input-contrast px-3 py-2"
                                                placeholder="Se preencher, substitui o assunto extraído do texto para todo o lote"
                                            />
                                            <InputError
                                                className="mt-1"
                                                message={errors.assunto}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Modelo
                                            </label>
                                            <select
                                                name="modelo"
                                                value={lf.modelo}
                                                onChange={(e) =>
                                                    setLf(
                                                        'modelo',
                                                        e.target.value,
                                                    )
                                                }
                                                className="gpdl-input-contrast px-3 py-2"
                                            >
                                                <option value="pje">PJE</option>
                                            </select>
                                            <InputError
                                                className="mt-1"
                                                message={errors.modelo}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Cole o texto completo do processo
                                        </label>
                                        <textarea
                                            name="texto"
                                            rows={12}
                                            value={lf.texto}
                                            onChange={(e) =>
                                                setLf('texto', e.target.value)
                                            }
                                            className="gpdl-input-contrast px-3 py-2"
                                            placeholder="Separe processos por uma linha em branco"
                                        ></textarea>
                                        <InputError
                                            className="mt-1"
                                            message={errors.texto}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 rounded-lg bg-[var(--brand-700)] px-4 py-2 text-white hover:bg-[var(--brand-600)] disabled:opacity-50"
                                        >
                                            <Plus className="h-4 w-4" />{' '}
                                            {processing
                                                ? 'Importando...'
                                                : 'Adicionar processo(s)'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => reset()}
                                            className="flex items-center gap-2 rounded-lg bg-[var(--surface-muted)] px-4 py-2"
                                        >
                                            <Eraser className="h-4 w-4" />{' '}
                                            Limpar campos
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentView === 'ativos' && (
                <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">
                        Ativos
                    </h2>
                    <Toolbar
                        filtros={f}
                        setF={setF}
                        onApply={applyFilters}
                        onClear={clearFilters}
                        procuradores={procuradores}
                    />
                    <TableList
                        itens={processos?.data || []}
                        empty="Nenhum processo ativo."
                        showActions
                        onFinalize={(id: number) => finalizeOne(id)}
                        finalizingId={finalizingId}
                    />
                    <Pager meta={processos} />
                </div>
            )}

            {currentView === 'pendentes' && (
                <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">
                        Pendentes
                    </h2>
                    <Toolbar
                        filtros={f}
                        setF={setF}
                        onApply={applyFilters}
                        onClear={clearFilters}
                        procuradores={procuradores}
                    />
                    <TableList
                        itens={processos?.data || []}
                        empty="Nenhum processo pendente."
                    />
                    <Pager meta={processos} />
                </div>
            )}

            {currentView === 'vencidos' && (
                <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">
                        Vencidos
                    </h2>
                    <Toolbar
                        filtros={f}
                        setF={setF}
                        onApply={applyFilters}
                        onClear={clearFilters}
                        procuradores={procuradores}
                    />
                    <TableList
                        itens={processos?.data || []}
                        empty="Nenhum processo vencido."
                    />
                    <Pager meta={processos} />
                </div>
            )}

            {currentView === 'distribuicao' && (
                <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">
                        Distribuicao
                    </h2>
                    <TablePlaceholder />
                </div>
            )}

            {currentView === 'encerrados' && (
                <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">
                        Finalizados
                    </h2>
                    <Toolbar
                        filtros={f}
                        setF={setF}
                        onApply={applyFilters}
                        onClear={clearFilters}
                        procuradores={procuradores}
                    />
                    <TableList
                        itens={processos?.data || []}
                        empty="Nenhum processo finalizado."
                    />
                    <Pager meta={processos} />
                </div>
            )}
        </GPDLLayout>
    );
}

function TableList({
    itens,
    empty,
    showActions = false,
    onFinalize,
    finalizingId,
}: {
    itens: ProcessoRow[];
    empty: string;
    showActions?: boolean;
    onFinalize?: (id: number) => void;
    finalizingId?: number | null;
}) {
    const [nowTick, setNowTick] = useState<number>(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    function Countdown({ value }: { value?: string | null }) {
        const [now, setNow] = useState<number>(() => Date.now());
        useEffect(() => {
            const id = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(id);
        }, []);
        if (!value) return <span>-</span>;
        const str = String(value).replace(' ', 'T');
        const target = new Date(str);
        if (isNaN(target.getTime())) return <span>{String(value)}</span>;
        const diff = target.getTime() - now;
        const past = diff < 0;
        const abs = Math.abs(diff);
        const totalSeconds = Math.floor(abs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        const text =
            days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
        const cls = past
            ? 'deadline-tag deadline-danger'
            : abs <= 86400000
              ? 'deadline-tag deadline-warn'
              : 'deadline-tag deadline-ok';
        return (
            <span className={cls}>
                {past ? 'Vencido há ' : 'Em '}
                {text}
            </span>
        );
    }

    function formatBrDate(value?: string | null) {
        if (!value) return '-';
        const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/.exec(String(value));
        if (m) return `${m[3]}/${m[2]}/${m[1]}`;
        const m2 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value));
        if (m2) return String(value);
        const d = new Date(String(value));
        if (!isNaN(d.getTime())) {
            const day = String(d.getUTCDate()).padStart(2, '0');
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const year = d.getUTCFullYear();
            return `${day}/${month}/${year}`;
        }
        return String(value);
    }
    if (!itens || itens.length === 0) {
        return <p className="text-sm text-[var(--text-muted)]">{empty}</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                <thead>
                    <tr className="bg-[var(--surface-muted)]">
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Orgao
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Acao
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Numero
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Assunto
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Vara/Juizo
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Partes envolvidas
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Prazo
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Ciencia
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Ultimo movimento
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Responsavel
                        </th>
                        {showActions && (
                            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                                Acoes
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gpdl-border)]">
                    {itens.map((p) => (
                        <tr
                            key={p.id}
                            className="hover:bg-[var(--surface-muted)]"
                        >
                            <td className="px-4 py-2 text-sm">
                                {p.orgao ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.acao ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.numero ?? p.id}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.assunto ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.vara_juizo ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.partes_envolvidas ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {(() => {
                                    const isFinalizadosView =
                                        typeof window !== 'undefined' &&
                                        new URLSearchParams(
                                            window.location.search,
                                        ).get('view') === 'encerrados';
                                    if (isFinalizadosView) {
                                        return (
                                            <span className="deadline-tag deadline-ok">
                                                Finalizado
                                            </span>
                                        );
                                    }
                                    if (!p.data_limite) {
                                        return (
                                            <span className="deadline-tag deadline-warn">
                                                Pendente
                                            </span>
                                        );
                                    }
                                    const str = String(p.data_limite).replace(
                                        ' ',
                                        'T',
                                    );
                                    const target = new Date(str);
                                    if (
                                        !isNaN(target.getTime()) &&
                                        target.getTime() < nowTick
                                    ) {
                                        return (
                                            <span className="deadline-tag deadline-danger">
                                                Prazo vencido
                                            </span>
                                        );
                                    }
                                    return <Countdown value={p.data_limite} />;
                                })()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {formatBrDate(p.data_ciencia)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.ultimo_mov_texto ?? '-'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                                {p.responsavel_nome ?? '-'}
                            </td>
                            {showActions && (
                                <td className="px-4 py-2 text-sm">
                                    <button
                                        onClick={() =>
                                            onFinalize && onFinalize(p.id)
                                        }
                                        disabled={
                                            !!finalizingId &&
                                            finalizingId === p.id
                                        }
                                        className="rounded bg-[var(--brand-700)] px-3 py-1 text-white hover:bg-[var(--brand-600)] disabled:opacity-50"
                                    >
                                        {finalizingId === p.id
                                            ? 'Finalizando...'
                                            : 'Finalizar'}
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TablePlaceholder() {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                <thead>
                    <tr className="bg-[var(--surface-muted)]">
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            No
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Assunto
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Interessado
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Setor
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gpdl-border)]">
                    {[1, 2, 3].map((i) => (
                        <tr key={i} className="hover:bg-[var(--surface-muted)]">
                            <td className="px-4 py-2 text-sm">2025.00{i}</td>
                            <td className="px-4 py-2 text-sm">
                                Lorem ipsum dolor {i}
                            </td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">-</td>
                            <td className="px-4 py-2 text-sm">-</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Toolbar({
    filtros,
    setF,
    onApply,
    onClear,
    procuradores,
}: {
    filtros: FiltersForm;
    setF: (k: keyof FiltersForm, v: string) => void;
    onApply: () => void;
    onClear: () => void;
    procuradores: Procurador[];
}) {
    return (
        <div className="mb-4">
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-elevate)] p-3">
                <div className="min-w-[220px]">
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Responsável
                    </label>
                    <select
    value={filtros.responsavel_id}
    onChange={(e) => {
        const value = e.target.value;
        setF('responsavel_id', value);

        // Gera a URL com o valor correto sem depender do estado assíncrono
        const q = new URLSearchParams(window.location.search);
        q.set('view', filtros.view || 'ativos');

        if (value.trim() !== '') {
            q.set('responsavel_id', value);
        } else {
            q.delete('responsavel_id');
        }

        if (filtros.order) q.set('order', filtros.order);
        if (filtros.per_page) q.set('per_page', filtros.per_page);

        router.get(`/processos?${q.toString()}`, {}, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    }}
    className="gpdl-input-contrast px-3 py-2"
>
                        <option value="">Todos</option>
                        {procuradores.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                                {p.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[220px]">
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">
                        Ordenar por
                    </label>
                    <select
                        value={filtros.order}
                        onChange={(e) => {
                            setF('order', e.target.value);
                            setTimeout(() => onApply && onApply(), 0);
                        }}
                        className="gpdl-input-contrast px-3 py-2"
                    >
                        <option value="prazo_asc">Prazo (mais urgente)</option>
                    </select>
                </div>

                <button
                    onClick={onClear}
                    className="rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-muted)] px-3 py-2 hover:border-[var(--brand-600)]/40"
                >
                    Limpar
                </button>
            </div>
        </div>
    );
}

function Pager({ meta }: { meta?: Paginator<ProcessoRow> }) {
    if (!meta) return null;
    const showing =
        meta.to && meta.from ? meta.to - meta.from + 1 : meta.data.length;

    const go = (url?: string | null) => {
        if (!url) return;
        router.get(
            url,
            {},
            { preserveScroll: true, preserveState: false, replace: true },
        );
    };

    return (
        <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-muted)]">
            <div>
                Mostrando {showing} de {meta.total} processos
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => go(meta.prev_page_url)}
                    disabled={!meta.prev_page_url}
                    className={`rounded px-3 py-1 ${meta.prev_page_url ? 'gpdl-link' : 'pointer-events-none opacity-50'}`}
                >
                    Anterior
                </button>
                <span>
                    {meta.current_page} de {meta.last_page}
                </span>
                <button
                    onClick={() => go(meta.next_page_url)}
                    disabled={!meta.next_page_url}
                    className={`rounded px-3 py-1 ${meta.next_page_url ? 'gpdl-link' : 'pointer-events-none opacity-50'}`}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}
