import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
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
  Shield,
  TriangleAlert,
  Users,
} from 'lucide-react'

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

export function GpdlSidebar() {
  const { permissions } = usePage().props as { permissions?: Permission }
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
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

  const [collapsed, setCollapsed] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [openProcessos, setOpenProcessos] = useState(pathname.includes('processos'))

  // 🧠 Persiste o estado do colapso no localStorage e evita piscada inicial
  useEffect(() => {
    const saved = localStorage.getItem('gpdl_sidebar_collapsed')
    if (saved) setCollapsed(saved === 'true')
    setIsReady(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('gpdl_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  // 🧭 Atualiza margin do conteúdo ao colapsar
  useEffect(() => {
    const main = document.querySelector<HTMLElement>('.gpdl-main-content')
    if (main) {
      main.style.transition = 'margin-left 0.3s ease'
      main.style.marginLeft = collapsed ? '80px' : '260px'
    }
  }, [collapsed])

  // ⏳ Antes de carregar estado real, renderiza estático (sem animação)
  if (!isReady) {
    return (
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col 
                   bg-[var(--gpdl-sidebar)] border-r border-white/10 shadow-lg"
        style={{ width: collapsed ? 80 : 260 }}
      />
    )
  }

  return (
    <motion.aside
      data-sidebar={collapsed ? 'collapsed' : 'expanded'}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 130, damping: 18, delay: 0.05 }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col 
                 bg-[var(--gpdl-sidebar)] border-r border-white/10 
                 shadow-lg overflow-hidden"
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-white/10 px-3 py-4 flex items-center justify-start gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10">
              <Link href={dashboard()} prefetch>
                <div className="flex items-center gap-3">
                  <div className="brand-icon">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  {!collapsed && (
                    <div className="brand-copy">
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

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          aria-label="Alternar tamanho da barra lateral"
        >
          {collapsed ? (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="flex-1 overflow-y-auto px-3 py-4">
        <span className="sidebar-section-title">Principal</span>
        <nav className="space-y-1">
          {can('view_dashboard') && (
            <Link
              href={dashboard()}
              className={`nav-link ${isActive('dashboard') ? 'is-active' : ''}`}
            >
              <Home className="h-4 w-4" />
              {!collapsed && <span>Início</span>}
            </Link>
          )}

          {can('view_process') && (
            <div>
              <button
                onClick={() => setOpenProcessos((v) => !v)}
                className="nav-link w-full"
                aria-expanded={openProcessos}
              >
                <FileText className="h-4 w-4" />
                {!collapsed && <span className="flex-1">Processos</span>}
                {!collapsed && (
                  <motion.svg
                    animate={{ rotate: openProcessos ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="caret h-4 w-4 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
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
                  >
                    <Link
                      href="/processos?view=ativos"
                      className={`nav-link ${isActive('processos', 'ativos') ? 'is-active' : ''}`}
                    >
                      <FileText className="h-4 w-4" />
                      {!collapsed && <span>Ativos</span>}
                    </Link>
                    <Link
                      href="/processos?view=pendentes"
                      className={`nav-link ${isActive('processos', 'pendentes') ? 'is-active' : ''}`}
                    >
                      <TriangleAlert className="h-4 w-4" />
                      {!collapsed && <span>Pendentes</span>}
                    </Link>
                    <Link
                      href="/processos?view=vencidos"
                      className={`nav-link ${isActive('processos', 'vencidos') ? 'is-active' : ''}`}
                    >
                      <TriangleAlert className="h-4 w-4" />
                      {!collapsed && <span>Vencidos</span>}
                    </Link>
                    <Link
                      href="/processos?view=encerrados"
                      className={`nav-link ${isActive('processos', 'encerrados') ? 'is-active' : ''}`}
                    >
                      <Lock className="h-4 w-4" />
                      {!collapsed && <span>Finalizados</span>}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {can('view_agenda') && (
            <Link href="/agenda" className={`nav-link ${isActive('agenda') ? 'is-active' : ''}`}>
              <Calendar className="h-4 w-4" />
              {!collapsed && <span>Agenda</span>}
            </Link>
          )}

          {can('view_reports') && (
            <Link
              href="/relatorios"
              className={`nav-link ${isActive('relatorios') ? 'is-active' : ''}`}
            >
              <ChartPie className="h-4 w-4" />
              {!collapsed && <span>Relatórios</span>}
            </Link>
          )}

          {can('view_admin') && (
            <Link href="/admin" className={`nav-link ${isActive('admin') ? 'is-active' : ''}`}>
              <Shield className="h-4 w-4" />
              {!collapsed && <span>Administração</span>}
            </Link>
          )}

          {can('view_squads') && (
            <Link href="/squads" className={`nav-link ${isActive('squads') ? 'is-active' : ''}`}>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sidebar-card"
          >
            <h3>Fluxos mais rápidos</h3>
            <p>Crie automações para etapas repetitivas e libere tempo para o time.</p>
            <button>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              Configurar agora
            </button>
          </motion.div>
        )}
        <NavUser />
      </SidebarFooter>
    </motion.aside>
  )
}
