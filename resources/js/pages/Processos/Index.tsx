import GPDLLayout from '@/layouts/gpdl-layout'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMemo, useRef, useState, useEffect } from 'react'
import { Layers, User as UserIcon, Zap, X, Plus, Eraser } from 'lucide-react'
import InputError from '@/components/input-error'

const views = ['cadastro', 'ativos', 'pendentes', 'vencidos', 'distribuicao', 'encerrados'] as const
type View = typeof views[number]

interface Procurador { id: number; nome: string }
interface Paginator<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
  per_page: number
  from?: number
  to?: number
  next_page_url?: string | null
  prev_page_url?: string | null
}

// Tipagem das linhas de processo usadas na tabela
interface ProcessoRow {
  id: number
  orgao?: string | null
  acao?: string | null
  numero?: string | null
  assunto?: string | null
  vara_juizo?: string | null
  partes_envolvidas?: string | null
  data_limite?: string | null
  data_ciencia?: string | null
  ultimo_mov_texto?: string | null
  responsavel_nome?: string | null
}

// Filtros do topo das listas
interface FiltersForm {
  responsavel_id: string
  order: string
  per_page: string
  view: View
}

// Formulário de cadastro em lote
interface LoteForm {
  modelo: 'pje'
  responsavel_id: string
  assunto: string
  texto: string
}

export default function ProcessosIndex({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const currentView: View = useMemo(() => {
    const params = new URLSearchParams(search)
    const v = (params.get('view') || 'ativos').toLowerCase()
    return (views as readonly string[]).includes(v) ? (v as View) : 'ativos'
  }, [search])

  const page = usePage<{ processos?: Paginator<ProcessoRow>; flash?: { success?: string; error?: string }; filters?: FiltersForm }>()
  const processos: Paginator<ProcessoRow> | undefined = page?.props?.processos
  const flashSuccess: string | undefined = page?.props?.flash?.success
  const flashError: string | undefined = page?.props?.flash?.error
  const filters: FiltersForm = (page?.props?.filters || { responsavel_id: '', order: 'prazo_asc', per_page: '10' }) as FiltersForm
  const [flashSuccessLocal, setFlashSuccessLocal] = useState<string>('')
  const [flashErrorLocal, setFlashErrorLocal] = useState<string>('')

  useEffect(() => { if (!flashSuccess) return; const sync = setTimeout(() => setFlashSuccessLocal(flashSuccess), 0); const id = setTimeout(() => setFlashSuccessLocal(''), 5000); return () => { clearTimeout(sync); clearTimeout(id) } }, [flashSuccess])

  useEffect(() => { if (!flashError) return; const sync = setTimeout(() => setFlashErrorLocal(flashError), 0); const id = setTimeout(() => setFlashErrorLocal(''), 6000); return () => { clearTimeout(sync); clearTimeout(id) } }, [flashError])
  // Auto-refresh for deadline lists to keep status updated
  useEffect(() => {
    if (!(['ativos','vencidos'].includes(currentView))) return
    const id = setInterval(() => {
      if (typeof window !== 'undefined') {
        router.get(window.location.pathname + window.location.search, {}, { preserveState: true, preserveScroll: true, replace: true })
      }
    }, 15000)
    return () => clearInterval(id)
  }, [currentView])

  const { data: f, setData: setF } = useForm<FiltersForm>({
    responsavel_id: String(filters.responsavel_id || ''),
    order: String(filters.order || 'prazo_asc'),
    per_page: String(filters.per_page || '10'),
    view: (filters.view as View) || currentView,
  })

  // Cadastro em lote
  const loteRef = useRef<HTMLDivElement | null>(null)
  const [showLote, setShowLote] = useState(true)
  const { data: lf, setData: setLf, post, processing, errors, reset } = useForm<LoteForm>({
    modelo: 'pje',
    responsavel_id: '',
    assunto: '',
    texto: '',
  })

  const breadcrumb = [{ title: 'Processos', href: '/processos' }]
  const [finalizingId, setFinalizingId] = useState<number | null>(null)
  
  const [localSuccess, setLocalSuccess] = useState<string>('')
  const [localError, setLocalError] = useState<string>('')

  function finalizeOne(id: number) {
    setFinalizingId(id)
    router.post(`/processos/${id}/finalizar`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setLocalError('')
        setLocalSuccess('Processo finalizado com sucesso.')
        setTimeout(() => setLocalSuccess(''), 4000)
      },
      onError: () => {
        setLocalSuccess('')
        setLocalError('Nao foi possivel finalizar o processo.')
        setTimeout(() => setLocalError(''), 4000)
      },
      onFinish: () => setFinalizingId(null),
    })
  }

  function applyFilters() {
    const q = new URLSearchParams({ view: String(f.view || currentView) })
    if (f.responsavel_id) q.set('responsavel_id', f.responsavel_id)
    if (f.order) q.set('order', f.order)
    if (f.per_page) q.set('per_page', f.per_page)
    router.get(`/processos?${q.toString()}`, {}, { preserveState: true, preserveScroll: true })
  }
  function clearFilters() {
    setF('responsavel_id', '')
    setF('order', 'prazo_asc')
    setF('per_page', '10')
    setF('view', 'ativos' as View)
    router.get(`/processos?view=ativos`, {}, { preserveState: true, preserveScroll: true })
  }

  return (
    <GPDLLayout breadcrumbs={breadcrumb}>
      <Head title={`Processos - ${currentView}`} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Processos</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Central de cadastros e acompanhamento</p>
        </div>
      </div>




      {(flashSuccessLocal || localSuccess) && (
        <Alert variant="success" className="mt-3 relative">
          <AlertDescription>{localSuccess || flashSuccessLocal}</AlertDescription>
          <button type="button" onClick={() => { setLocalSuccess(''); setFlashSuccessLocal('') }} className="absolute right-2 top-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
        </Alert>
      )}
      {/* Navegacao removida: comandos via sidebar */}
      {(flashErrorLocal || localError) && (
        <Alert variant="destructive" className="mt-3 relative">
          <AlertDescription>{localError || flashErrorLocal}</AlertDescription>
        </Alert>
      )}

      {/* Navega??o removida: comandos via sidebar */}

      {currentView === 'cadastro' && (
        <div className="space-y-4 mt-4">
          <div className="bg-[var(--surface-card)] p-6 rounded-xl shadow-sm border border-[var(--gpdl-border)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-strong)]">Central de cadastros</h2>
                <p className="text-sm text-[var(--text-muted)]">Escolha o formato de cadastro ideal. A opção em lotes aceita diversas linhas de processos e aplica as mesmas regras de distribuição.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--gpdl-border)]">Guia rapido</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button type="button" onClick={() => setShowLote(false)} className={`text-left group border border-[var(--gpdl-border)] rounded-2xl p-5 bg-[var(--surface-elevate)] hover:border-[var(--brand-600)]/40 transition ${!showLote ? 'ring-1 ring-[var(--brand-600)]/40' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--text-muted)]">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[var(--text-strong)] font-medium">Cadastro individual</div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Inclua um processo por vez, validando os detalhes com atenção.</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-muted)]">Em breve</span>
                </div>
              </button>

              <button type="button" onClick={() => { setShowLote(true); requestAnimationFrame(() => loteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }} className={`text-left group border border-[var(--gpdl-border)] rounded-2xl p-5 bg-[var(--surface-elevate)] hover:border-[var(--brand-600)]/40 transition ${showLote ? 'ring-1 ring-[var(--brand-600)]/40' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--text-muted)]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[var(--text-strong)] font-medium">Cadastro em lote</div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Importe varios processos de uma unica vez copiando o conteudo da publicação.</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-muted)] flex items-center gap-1"><Zap className="w-3 h-3" /> Produtividade</span>
                </div>
              </button>
            </div>

            {showLote && (
              <div ref={loteRef} className="mt-6 border border-dashed border-[var(--gpdl-border)] rounded-xl p-4 bg-[var(--surface-elevate)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-strong)]">Importar processos em lotes</h3>
                    <p className="text-xs text-[var(--text-muted)]">Defina o responsavel e cole o conteudo integral da publicação.</p>
                  </div>
                  <button type="button" onClick={() => setShowLote(false)} className="text-xs px-3 py-1 rounded-full bg-[var(--surface-muted)] border border-[var(--gpdl-border)] hover:border-[var(--brand-600)]/40 flex items-center gap-1"><X className="w-3 h-3" /> Fechar painel</button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    post('/processos/importar-lote', {
                      preserveScroll: true,
                      onSuccess: () => reset('assunto', 'texto'),
                    })
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Responsável</label>
                      <select name="responsavel_id" value={lf.responsavel_id} onChange={(e) => setLf('responsavel_id', e.target.value)} className="gpdl-input-contrast px-3 py-2">
                        <option value="">Selecione um procurador</option>
                        {procuradores.map((p) => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                      <InputError className="mt-1" message={errors.responsavel_id} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Assunto (opcional)</label>
                      <input name="assunto" value={lf.assunto} onChange={(e) => setLf('assunto', e.target.value)} className="gpdl-input-contrast px-3 py-2" placeholder="Se preencher, substitui o assunto extraído do texto para todo o lote" />
                      <InputError className="mt-1" message={errors.assunto} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Modelo</label>
                      <select name="modelo" value={lf.modelo} onChange={(e) => setLf('modelo', e.target.value)} className="gpdl-input-contrast px-3 py-2">
                        <option value="pje">PJE</option>
                      </select>
                      <InputError className="mt-1" message={errors.modelo} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cole o texto completo do processo</label>
                    <textarea name="texto" rows={12} value={lf.texto} onChange={(e) => setLf('texto', e.target.value)} className="gpdl-input-contrast px-3 py-2" placeholder="Separe processos por uma linha em branco"></textarea>
                    <InputError className="mt-1" message={errors.texto} />
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={processing} className="px-4 py-2 rounded-lg bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] disabled:opacity-50 flex items-center gap-2"><Plus className="w-4 h-4" /> {processing ? 'Importando...' : 'Adicionar processo(s)'}</button>
                    <button type="button" onClick={() => reset()} className="px-4 py-2 rounded-lg bg-[var(--surface-muted)] flex items-center gap-2"><Eraser className="w-4 h-4" /> Limpar campos</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === 'ativos' && (
        <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm mt-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Ativos</h2>
          <Toolbar filtros={f} setF={setF} onApply={applyFilters} onClear={clearFilters} procuradores={procuradores} />
          <TableList itens={processos?.data || []} empty="Nenhum processo ativo." showActions onFinalize={(id:number)=>finalizeOne(id)} finalizingId={finalizingId} />
          <Pager meta={processos} />
        </div>
      )}

      {currentView === 'pendentes' && (
        <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm mt-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Pendentes</h2>
          <Toolbar filtros={f} setF={setF} onApply={applyFilters} onClear={clearFilters} procuradores={procuradores} />
          <TableList itens={processos?.data || []} empty="Nenhum processo pendente." />
          <Pager meta={processos} />
        </div>
      )}

      {currentView === 'vencidos' && (
        <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm mt-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Vencidos</h2>
          <Toolbar filtros={f} setF={setF} onApply={applyFilters} onClear={clearFilters} procuradores={procuradores} />
          <TableList itens={processos?.data || []} empty="Nenhum processo vencido." />
          <Pager meta={processos} />
        </div>
      )}

      {currentView === 'distribuicao' && (
        <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm mt-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Distribuicao</h2>
          <TablePlaceholder />
        </div>
      )}

      {currentView === 'encerrados' && (
        <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm mt-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Finalizados</h2>
          <Toolbar filtros={f} setF={setF} onApply={applyFilters} onClear={clearFilters} procuradores={procuradores} />
          <TableList itens={processos?.data || []} empty="Nenhum processo finalizado." />
          <Pager meta={processos} />
        </div>
      )}
    </GPDLLayout>
  )
}

function TableList({ itens, empty, showActions = false, onFinalize, finalizingId }: { itens: ProcessoRow[]; empty: string; showActions?: boolean; onFinalize?: (id:number)=>void; finalizingId?: number | null }) {
  const [nowTick, setNowTick] = useState<number>(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNowTick(Date.now()), 1000); return () => clearInterval(id) }, [])

  function Countdown({ value }: { value?: string | null }) {
    const [now, setNow] = useState<number>(() => Date.now())
    useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(id)
    }, [])
    if (!value) return <span>-</span>
    const str = String(value).replace(' ', 'T')
    const target = new Date(str)
    if (isNaN(target.getTime())) return <span>{String(value)}</span>
    const diff = target.getTime() - now
    const past = diff < 0
    const abs = Math.abs(diff)
    const totalSeconds = Math.floor(abs / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const hh = String(hours).padStart(2, '0')
    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')
    const text = days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`
    const cls = past ? 'deadline-tag deadline-danger' : (abs <= 86400000 ? 'deadline-tag deadline-warn' : 'deadline-tag deadline-ok')
    return <span className={cls}>{past ? 'Vencido h� ' : 'Em '}{text}</span>
  }

  function formatBrDate(value?: string | null) {
    if (!value) return '-'
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/.exec(String(value))
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    const m2 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value))
    if (m2) return String(value)
    const d = new Date(String(value))
    if (!isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, '0')
      const month = String(d.getUTCMonth() + 1).padStart(2, '0')
      const year = d.getUTCFullYear()
      return `${day}/${month}/${year}`
    }
    return String(value)
  }
  if (!itens || itens.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">{empty}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
        <thead>
          <tr className="bg-[var(--surface-muted)]">
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Orgao</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Acao</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Numero</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Assunto</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Vara/Juizo</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Partes envolvidas</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Prazo</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Ciencia</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Ultimo movimento</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Responsavel</th>
            {showActions && (<th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Acoes</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--gpdl-border)]">
          {itens.map((p) => (
            <tr key={p.id} className="hover:bg-[var(--surface-muted)]">
              <td className="px-4 py-2 text-sm">{p.orgao ?? '-'}</td>
              <td className="px-4 py-2 text-sm">{p.acao ?? '-'}</td>
              <td className="px-4 py-2 text-sm">{p.numero ?? p.id}</td>
              <td className="px-4 py-2 text-sm">{p.assunto ?? '-'}</td>
              <td className="px-4 py-2 text-sm">{p.vara_juizo ?? '-'}</td>
              <td className="px-4 py-2 text-sm">{p.partes_envolvidas ?? '-'}</td>
              <td className="px-4 py-2 text-sm">{(()=>{ const isFinalizadosView = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "encerrados"); if(isFinalizadosView){ return <span className="deadline-tag deadline-ok">Finalizado</span>; } if(!p.data_limite){ return <span className="deadline-tag deadline-warn">Pendente</span>; } const str = String(p.data_limite).replace(" ", "T"); const target = new Date(str); if(!isNaN(target.getTime()) && target.getTime() < nowTick){ return <span className="deadline-tag deadline-danger">Prazo vencido</span>; } return <Countdown value={p.data_limite} />; })()}</td>
              <td className="px-4 py-2 text-sm">{formatBrDate(p.data_ciencia)}</td>
              <td className="px-4 py-2 text-sm">{p.ultimo_mov_texto ?? '-'}</td>
              <td className="px-4 py-2 text-sm">{p.responsavel_nome ?? '-'}</td>
              {showActions && (
                <td className="px-4 py-2 text-sm">
                  <button onClick={() => onFinalize && onFinalize(p.id)} disabled={!!finalizingId && finalizingId === p.id} className="px-3 py-1 rounded bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] disabled:opacity-50">
                    {finalizingId === p.id ? 'Finalizando...' : 'Finalizar'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablePlaceholder() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
        <thead>
          <tr className="bg-[var(--surface-muted)]">
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">No</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Assunto</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Interessado</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Setor</th>
            <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--gpdl-border)]">
          {[1, 2, 3].map((i) => (
            <tr key={i} className="hover:bg-[var(--surface-muted)]">
              <td className="px-4 py-2 text-sm">2025.00{i}</td>
              <td className="px-4 py-2 text-sm">Lorem ipsum dolor {i}</td>
              <td className="px-4 py-2 text-sm">-</td>
              <td className="px-4 py-2 text-sm">-</td>
              <td className="px-4 py-2 text-sm">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Toolbar({ filtros, setF, onApply, onClear, procuradores }: { filtros: FiltersForm; setF: (k: keyof FiltersForm, v: string) => void; onApply: () => void; onClear: () => void; procuradores: Procurador[] }) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-end gap-3 p-3 border border-[var(--gpdl-border)] rounded-lg bg-[var(--surface-elevate)]">
        <div className="min-w-[180px]">
          <label className="block text-xs text-[var(--text-muted)] mb-1">Situação</label>
          <select
            value={filtros.view}
            onChange={(e) => {
              setF('view', e.target.value as View)
              setTimeout(() => onApply && onApply(), 0)
            }}
            className="gpdl-input-contrast px-3 py-2"
          >
            <option value="ativos">Ativos</option>
            <option value="pendentes">Pendentes</option>
            <option value="vencidos">Vencidos</option>
            <option value="encerrados">Finalizados</option>
          </select>
        </div>
        <div className="min-w-[220px]">
          <label className="block text-xs text-[var(--text-muted)] mb-1">Responsavel</label>
          <select
            value={filtros.responsavel_id}
            onChange={(e) => {
              setF('responsavel_id', e.target.value)
              setTimeout(() => onApply && onApply(), 0)
            }}
            className="gpdl-input-contrast px-3 py-2"
          >
            <option value="">Todos</option>
            {procuradores.map((p: Procurador) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[220px]">
          <label className="block text-xs text-[var(--text-muted)] mb-1">Ordenar por</label>
          <select
            value={filtros.order}
            onChange={(e) => {
              setF('order', e.target.value)
              setTimeout(() => onApply && onApply(), 0)
            }}
            className="gpdl-input-contrast px-3 py-2"
          >
            <option value="prazo_asc">Prazo (mais urgente)</option>
          </select>
        </div>
        {/* Botao de limpar ao lado dos filtros */}
        <button onClick={onClear} className="px-3 py-2 rounded-lg bg-[var(--surface-muted)] border border-[var(--gpdl-border)] hover:border-[var(--brand-600)]/40">Limpar</button>
      </div>
    </div>
  )
}

function Pager({ meta }: { meta?: Paginator<ProcessoRow> }) {
  if (!meta) return null
  const showing = meta.to && meta.from ? meta.to - meta.from + 1 : meta.data.length
  return (
    <div className="flex items-center justify-between text-sm text-[var(--text-muted)] mt-3">
      <div>Mostrando {showing} de {meta.total} processos</div>
      <div className="flex items-center gap-2">
        <a href={meta.prev_page_url || '#'} className={`px-3 py-1 rounded ${meta.prev_page_url ? 'gpdl-link' : 'opacity-50 pointer-events-none'}`}>Anterior</a>
        <span>{meta.current_page} de {meta.last_page}</span>
        <a href={meta.next_page_url || '#'} className={`px-3 py-1 rounded ${meta.next_page_url ? 'gpdl-link' : 'opacity-50 pointer-events-none'}`}>Proxima</a>
      </div>
    </div>
  )
}
















