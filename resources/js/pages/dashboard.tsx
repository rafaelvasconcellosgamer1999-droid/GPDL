import GPDLLayout from '@/layouts/gpdl-layout'
import { dashboard } from '@/routes'
import { type BreadcrumbItem, type SharedData } from '@/types'
import { Head, usePage, Link, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, AlertTriangle } from 'lucide-react'

type DashboardStats = { ativos: number; pendentes: number; vencidos: number; finalizados7d: number; finalizadosMes: number; ativos_hoje: number; ativos_48h: number }
type ProcessoResumo = { titulo: string; entidade?: string | null; responsavel?: string | null; vencimento?: string | null }
type Capacidade = { sigla: string; nome: string; processos: number; perc: number }

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
]

export default function Dashboard() {
  const { auth } = usePage<SharedData>().props
  const page = usePage().props as {
    stats?: DashboardStats
    emAndamento?: ProcessoResumo[]
    capacidade?: Capacidade[]
    capView?: 'ativos' | 'pendentes' | 'vencidos' | 'encerrados' | 'ativos_hoje' | 'ativos_48h'
  }

  const stats: DashboardStats = page.stats ?? { ativos: 0, vencidos: 0, finalizados7d: 0, pendentes: 0, ativos_hoje: 0, ativos_48h: 0, finalizadosMes: 0 }
  const emAndamento: ProcessoResumo[] = page.emAndamento ?? []
  const capacidade: Capacidade[] = page.capacidade ?? []
  const capView = page.capView ?? 'ativos'

  const firstName = auth?.user?.name ? String(auth.user.name).split(' ')[0] : ''
  const labelPorView: Record<string, string> = {
    ativos: 'processos ativos',
    pendentes: 'processos pendentes',
    vencidos: 'processos vencidos',
    encerrados: 'processos finalizados',
    ativos_hoje: 'processos que vencem hoje',
    ativos_48h: 'processos que vencem em 48h',
  }

  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard - GPDL" />

      {/* Hero de boas-vindas */}
      <div className="gpdl-hero mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="gpdl-chip mb-4">
              <span>PAINEL GERAL</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              {`Bem-vindo${firstName ? `, ${firstName}!` : '!'}`}
            </h1>
            <p className="text-white/85 mt-2 text-sm md:text-base">
              Você tem {stats.ativos} processos ativos e {stats.ativos_hoje} com risco elevado. Priorize os itens que vencem hoje.
            </p>
          </div>

          <div className="hidden md:flex min-w-[260px]">
            <div className="flex w-full flex-col gap-3">
              <div
                className="gpdl-card metric-card metric-card-neutral w-full p-4 cursor-pointer"
                role="link"
                tabIndex={0}
                onClick={() => router.visit('/processos?view=encerrados')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.visit('/processos?view=encerrados')
                  }
                }}
              >
                <div className="text-xs text-(--text-muted) mb-2">Processos finalizados no mês</div>
                <div className="text-3xl font-semibold text-white">{stats.finalizadosMes}</div>
                <div className="mt-1 text-xs text-white/80">
                  +{stats.finalizados7d} nos últimos 7 dias
                </div>
                <div className="mt-2 text-xs">
                  <Link className="gpdl-link" href="/relatorios" onClick={(e) => e.stopPropagation()}>
                    Ver relatório
                  </Link>
                </div>
              </div>
              <Link href="/processos?view=pendentes" className="gpdl-review-callout">
                <div className="text-sm font-medium">
                  {stats.pendentes > 0
                    ? `${stats.pendentes} processo${stats.pendentes !== 1 ? 's' : ''} aguardam sua revisão.`
                    : 'Nenhum processo pendente de ciência no momento.'}
                </div>
                <span className="text-[0.72rem] font-semibold">ABRIR FILA</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de métricas (sem redundância) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="gpdl-card metric-card metric-card-blue relative hover:opacity-95 transition cursor-pointer">
          <CardHeader>
            <CardDescription className="metric-label">Processos ativos</CardDescription>
            <CardTitle className="metric-value text-(--brand-600)">{stats.ativos}</CardTitle>
            <LineChart className="metric-icon text-(--brand-600) h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="metric-trend">
              Hoje: {stats.ativos_hoje ?? 0} | 48h: {stats.ativos_48h ?? 0}
            </p>
            <div className="mt-2">
              <span className="metric-link blue"><LineChart className="h-4 w-4" /> Ver lista</span>
            </div>
          </CardContent>
          <Link href="/processos?view=ativos" aria-label="Ver processos ativos" className="absolute inset-0" />
        </Card>

        <Card className="gpdl-card metric-card metric-card-red relative hover:opacity-95 transition cursor-pointer">
          <CardHeader>
            <CardDescription className="metric-label">Processos vencidos</CardDescription>
            <CardTitle className="metric-value text-(--danger-500)">{stats.vencidos}</CardTitle>
            <AlertTriangle className="metric-icon text-(--danger-500) h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <span className="metric-link red"><AlertTriangle className="h-4 w-4" /> Monitorar itens críticos</span>
            </div>
          </CardContent>
          <Link href="/processos?view=vencidos" aria-label="Ver processos vencidos" className="absolute inset-0" />
        </Card>
      </div>

      {/* Linha inferior: processos em andamento e capacidade do time */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {/* Coluna esquerda (2/3) */}
        <Card className="gpdl-card xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Processos em andamento</CardTitle>
              <CardDescription>Resumo das demandas que precisam de acompanhamento nesta semana.</CardDescription>
            </div>
            <Link className="gpdl-chip text-white/90" href="/processos?view=ativos">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {emAndamento.length === 0 && (
              <div className="text-sm text-(--text-muted)">Sem dados disponíveis.</div>
            )}
            {emAndamento.map((p, i) => (
              <div key={i} className="rounded-xl border border-(--gpdl-border) bg-(--surface-card)/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{p.titulo}</div>
                    {(p.entidade || p.responsavel) && (
                      <div className="text-xs text-(--text-muted)">{p.entidade}{p.entidade && p.responsavel ? ' • ' : ''}{p.responsavel ? ` Responsável: ${p.responsavel}` : ''}</div>
                    )}
                    <a className="gpdl-link text-xs mt-1 inline-block" href="#">Ver detalhes</a>
                  </div>
                  {p.vencimento && (
                    <div className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80">{p.vencimento}</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coluna direita (1/3) */}
        <Card className="gpdl-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Capacidade do time</CardTitle>
              <CardDescription>Acompanhe a distribuição das demandas por pessoa.</CardDescription>
            </div>
            <div>
              <label className="sr-only">Situação</label>
              <select
                value={capView}
                onChange={(e) => {
                  const v = e.target.value
                  const base = typeof window !== 'undefined' ? window.location.pathname : '/dashboard'
                  router.get(`${base}?cap_view=${encodeURIComponent(v)}`, {}, { preserveState: true, preserveScroll: true, replace: true })
                }}
                className="gpdl-input-contrast px-3 py-1 text-xs rounded-lg"
              >
                <option value="ativos">Ativos</option>
                <option value="pendentes">Pendentes</option>
                <option value="vencidos">Vencidos</option>
                <option value="encerrados">Finalizados</option>
                <option value="ativos_hoje">Vencem hoje</option>
                <option value="ativos_48h">Próximos 2 dias</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {capacidade.length === 0 && (
              <div className="text-sm text-(--text-muted)">Sem dados disponíveis.</div>
            )}

            {capacidade.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-(--gpdl-border) bg-(--surface-card)/80 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white/90 flex items-center justify-center text-xs font-semibold">
                      {p.sigla}
                    </div>
                    <div className="text-sm text-white/90">
                      <div className="font-medium">{p.nome}</div>
                      <div className="text-(--text-muted) text-xs">
                        {p.processos} {labelPorView[capView] || 'processos'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-white/70">{p.perc}%</div>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${p.perc}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </GPDLLayout>
  )
}



