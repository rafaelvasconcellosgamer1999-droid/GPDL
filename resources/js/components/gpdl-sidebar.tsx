import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavUser } from '@/components/nav-user'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { dashboard } from '@/routes'
import { Link, usePage } from '@inertiajs/react'
import {
  Calendar,
  ChartPie,
  FileText,
  Home,
  LayoutDashboard,
  Lock,
  Share2,
  Plus,
  Shield,
  TriangleAlert,
  Users,
} from 'lucide-react'
import clsx from 'clsx'

interface Permission {
  view_dashboard?: string
  view_process?: string
  create_process?: string
  edit_process?: string
  finalize_process?: string
  view_agenda?: string
  view_reports?: string
  view_admin?: string
  view_squads?: string
  manage_squads?: string
  view_logs?: string
  view_audit?: string
}

type Props = { className?: string }

export function GpdlSidebar({ className }: Props) {
  const { permissions } = usePage().props as { permissions?: Permission }
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : ''
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
  const currentView = searchParams.get('view') || undefined

  const can = (permission: keyof Permission, levels?: string[]) => {
    if (!permissions) return true
    if (!permissions[permission]) return false
    if (!levels) return true
    return levels.some((level) => permissions[permission]?.includes(level))
  }

  const isActive = (routeName: string, view?: string) => {
    if (view && currentView) {
      return pathname.includes(routeName) && currentView === view
    }
    return pathname.includes(routeName)
  }

  // ✅ Lê o colapso do localStorage NO INICIALIZADOR (sem useEffect + setState)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('gpdl_sidebar_collapsed')
    return saved === 'true'
  })

  // Abre o submenu “Processos” por padrão se a rota atual já for /processos
  const [openProcessos, setOpenProcessos] = useState(
    pathname.includes('processos')
  )

  // Persiste alterações de colapso
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gpdl_sidebar_collapsed', String(collapsed))
    }
  }, [collapsed])

  return (
    <motion.aside
      data-sidebar={collapsed ? 'collapsed' : 'expanded'}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 130, damping: 18 }}
      className={clsx(
        // ⚙️ Base
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col h-screen',
        'bg-[var(--gpdl-sidebar)] border-r border-white/10 shadow-lg',
        'overflow-hidden overflow-x-hidden', // 🚫 impede scroll lateral
        'gpdl-shell-sidebar',
        className
      )}
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-white/10 px-3 py-4 flex items-center justify-between gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-white/10"
            >
              <Link href={dashboard()} prefetch>
                <div className="flex items-center gap-3">
                  {/* Ícone agora também colapsa */}
                  <div
                    className="brand-icon cursor-pointer active:scale-95 transition-transform"
                    onClick={(e) => {
                      e.preventDefault()
                      setCollapsed((c) => {
                        const newState = !c
                        localStorage.setItem('gpdl_sidebar_collapsed', String(newState))
                        window.dispatchEvent(new Event('sidebar:toggle')) // 🔔 notifica o layout
                        return newState
                      })
                    }}
                    title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </div>

                  {/* Texto só aparece se não estiver colapsado */}
                  {!collapsed && (
                    <div className="brand-copy select-none">
                      <span className="text-xs text-white/70 uppercase tracking-wider">
                        Gerenciador
                      </span>
                      <strong className="text-white font-semibold">Processos</strong>
                    </div>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* ❌ Botão da seta removido completamente */}
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-4">
        <span className="sidebar-section-title">Principal</span>

        <nav className="space-y-1">
          {can('view_dashboard') && (
            <Link
              href={dashboard()}
              className={clsx('nav-link', isActive('dashboard') && 'is-active')}
            >
              <Home className="h-4 w-4" />
              {!collapsed && <span>Início</span>}
            </Link>
          )}

          {can('view_process') && (
            <div>
              <button
                onClick={() => setOpenProcessos((v) => !v)}
                className={clsx(
                  'nav-link relative w-full',
                  openProcessos && 'is-active'
                )}
                aria-expanded={openProcessos}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">Processos</span>
                    <motion.svg
                      animate={{ rotate: openProcessos ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="caret h-4 w-4 text-white/70 absolute right-3 top-1/2 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </>
                )}
              </button>

              <AnimatePresence initial={false}>
                {openProcessos && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="nav-sub"
                    data-state="open"
                  >
                    {/* ✅ NOVA OPÇÃO DE CADASTRO */}
                    {can('create_process', ['all', 'sector']) && (
                      <Link
                        href="/processos?view=cadastro"
                        className={clsx('nav-link', isActive('processos', 'cadastro') && 'is-active')}
                      >
                        <Plus className="h-4 w-4" />

                        {!collapsed && <span>Cadastro</span>}
                      </Link>
                    )}      <Link
                      href="/processos?view=ativos"
                      className={clsx('nav-link', isActive('processos', 'ativos') && 'is-active')}
                    >
                      <FileText className="h-4 w-4" />
                      {!collapsed && <span>Ativos</span>}
                    </Link>

                    <Link
                      href="/processos?view=pendentes"
                      className={clsx('nav-link', isActive('processos', 'pendentes') && 'is-active')}
                    >
                      <TriangleAlert className="h-4 w-4" />
                      {!collapsed && <span>Pendentes</span>}
                    </Link>

                    <Link
                      href="/processos?view=vencidos"
                      className={clsx('nav-link', isActive('processos', 'vencidos') && 'is-active')}
                    >
                      <TriangleAlert className="h-4 w-4" />
                      {!collapsed && <span>Vencidos</span>}
                    </Link>

                    <Link
                      href="/processos?view=encerrados"
                      className={clsx('nav-link', isActive('processos', 'encerrados') && 'is-active')}
                    >

                      <Lock className="h-4 w-4" />
                      {!collapsed && <span>Finalizados</span>}
                    </Link>
                    {can('edit_process', ['sector', 'all']) && (
                      <Link
                        href="/processos?view=distribuicao"
                        className={clsx('nav-link', isActive('processos', 'distribuicao') && 'is-active')}
                      >
                        <Share2 className="h-4 w-4" />
                        {!collapsed && <span>Distribuição</span>}
                      </Link>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {can('view_agenda') && (
            <Link
              href="/agenda"
              className={clsx('nav-link', isActive('agenda') && 'is-active')}
            >
              <Calendar className="h-4 w-4" />
              {!collapsed && <span>Agenda</span>}
            </Link>
          )}

          {can('view_reports') && (
            <Link
              href="/relatorios"
              className={clsx('nav-link', isActive('relatorios') && 'is-active')}
            >
              <ChartPie className="h-4 w-4" />
              {!collapsed && <span>Relatórios</span>}
            </Link>
          )}

          {can('view_admin') && (
            <Link
              href="/admin"
              className={clsx('nav-link', isActive('admin') && 'is-active')}
            >
              <Shield className="h-4 w-4" />
              {!collapsed && <span>Administração</span>}
            </Link>
          )}

          {can('view_squads') && (
            <Link
              href="/squads"
              className={clsx('nav-link', isActive('squads') && 'is-active')}
            >
              <Users className="h-4 w-4" />
              {!collapsed && <span>Squads</span>}
            </Link>
          )}
        </nav>

        {(can('view_logs') || can('view_audit')) && (
          <>
            {!collapsed && <span className="sidebar-section-title mt-6">Monitoramento</span>}
            <nav className="space-y-1">
              {can('view_logs') && (
                <Link href="/logs" className="nav-link">
                  <Shield className="h-4 w-4" />
                  {!collapsed && <span>Logs do Sistema</span>}
                </Link>
              )}
              {can('view_audit') && (
                <Link href="/auditoria" className="nav-link">
                  <Shield className="h-4 w-4" />
                  {!collapsed && <span>Auditoria</span>}
                </Link>
              )}
            </nav>
          </>
        )}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-white/10 p-4">
        {!collapsed && (
          <div className="sidebar-card-wrap">
            <div className="sidebar-card">
              <h3>Fluxos mais rápidos</h3>
              <p>Crie automações para etapas repetitivas e libere tempo para o time.</p>
              <button>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                Configurar agora
              </button>
            </div>
          </div>
        )}
        <NavUser />
      </SidebarFooter>
    </motion.aside>
  )
}
