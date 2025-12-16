import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavUser } from '@/components/nav-user'
import type { InertiaLinkProps } from '@inertiajs/react'
import { resolveUrl } from '@/lib/utils'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { navigationItems, type NavigationItem, type PermissionRequirement } from '@/navigation/menu'
import { canAccessPermission, type PermissionMap } from '@/navigation/permissions'
import { dashboard } from '@/routes'
import { Link, usePage } from '@inertiajs/react'
import { LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'

type Props = { className?: string }

export function GpdlSidebar({ className }: Props) {
  const { permissions } = usePage().props as { permissions?: PermissionMap }

  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : ''

  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()

  const canAccess = (requirement?: PermissionRequirement) =>
    canAccessPermission(permissions, requirement)

  const routeMatches = (match?: NavigationItem['match']) => {
    if (!match) return false

    const segmentMatch = match.segment
      ? pathname.includes(match.segment)
      : true

    const queryMatch = match.query
      ? searchParams.get(match.query.key) === match.query.value
      : true

    return segmentMatch && queryMatch
  }

  const toPathname = (href: InertiaLinkProps['href']) => {
    if (!href) return ''
    try {
      const base =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost'
      const url = resolveUrl(href)
      return new URL(url, base).pathname
    } catch {
      return typeof href === 'string' ? href : resolveUrl(href)
    }
  }

  /**
   * 🔒 REGRA DE ATIVAÇÃO CORRETA
   * - Match explícito sempre vence
   * - Item folha → match EXATO
   * - Grupo → ativo se algum filho estiver ativo
   */
  const matchesItem = (item: NavigationItem): boolean => {
    const hrefPath = item.href ? toPathname(item.href) : null

    // 1️⃣ Match explícito
    if (routeMatches(item.match)) {
      return true
    }

    // 2️⃣ Item folha → match exato
    if (hrefPath && !item.children?.length) {
      return pathname === hrefPath
    }

    // 3️⃣ Grupo → ativo se algum filho estiver ativo
    if (item.children?.length) {
      return item.children.some((child) => matchesItem(child))
    }

    return false
  }

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('gpdl_sidebar_collapsed')
    return saved === 'true'
  })

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navigationItems.forEach((item) => {
      if (item.children?.length && matchesItem(item)) {
        initial[item.id] = true
      }
    })
    return initial
  })

  const isGroupOpen = (item: NavigationItem) =>
    openGroups[item.id] ?? matchesItem(item)

  const toggleGroup = (itemId: string) => {
    setOpenGroups((state) => ({
      ...state,
      [itemId]: !state[itemId],
    }))
  }

  const mainNavigation = navigationItems.filter(
    (item) => (item.section ?? 'main') === 'main'
  )

  const monitorNavigation = navigationItems.filter(
    (item) => item.section === 'monitor'
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'gpdl_sidebar_collapsed',
        String(collapsed)
      )
    }
  }, [collapsed])

  return (
    <motion.aside
      data-sidebar={collapsed ? 'collapsed' : 'expanded'}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 130, damping: 18 }}
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col h-screen',
        'bg-(--gpdl-sidebar) border-r border-white/10 shadow-lg',
        'overflow-hidden overflow-x-hidden',
        'gpdl-shell-sidebar',
        className
      )}
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-white/10 px-3 py-4 flex items-center justify-between gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10">
              <Link href={dashboard()} prefetch>
                <div className="flex items-center gap-3">
                  <div
                    className="brand-icon cursor-pointer active:scale-95 transition-transform"
                    onClick={(e) => {
                      e.preventDefault()
                      setCollapsed((c) => {
                        const next = !c
                        localStorage.setItem(
                          'gpdl_sidebar_collapsed',
                          String(next)
                        )
                        window.dispatchEvent(
                          new Event('sidebar:toggle')
                        )
                        return next
                      })
                    }}
                    title={
                      collapsed
                        ? 'Expandir sidebar'
                        : 'Recolher sidebar'
                    }
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </div>

                  {!collapsed && (
                    <div className="brand-copy select-none">
                      <span className="text-xs text-white/70 uppercase tracking-wider">
                        Gerenciador
                      </span>
                      <strong className="text-white font-semibold">
                        Processos
                      </strong>
                    </div>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-4">
        <span className="sidebar-section-title">Principal</span>

        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            if (!canAccess(item.permission)) return null

            const Icon = item.icon

            if (item.children?.length) {
              const open = isGroupOpen(item)

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={clsx(
                      'nav-link relative w-full',
                      open && 'is-active'
                    )}
                    aria-expanded={open}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">
                          {item.label}
                        </span>
                        <motion.svg
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="caret h-4 w-4 text-white/70 absolute right-3 top-1/2 -translate-y-1/2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      </>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: 'easeInOut',
                        }}
                        className="nav-sub"
                        data-state="open"
                      >
                        {item.children
                          .filter((child) =>
                            canAccess(child.permission)
                          )
                          .map((child) => {
                            if (!child.href) return null
                            const ChildIcon = child.icon
                            return (
                              <Link
                                key={child.id}
                                href={child.href}
                                className={clsx(
                                  'nav-link',
                                  matchesItem(child) && 'is-active'
                                )}
                              >
                                <ChildIcon className="h-4 w-4" />
                                {!collapsed && (
                                  <span>{child.label}</span>
                                )}
                              </Link>
                            )
                          })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            if (!item.href) return null

            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  'nav-link',
                  matchesItem(item) && 'is-active'
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {monitorNavigation.some((item) =>
          canAccess(item.permission)
        ) && (
            <>
              {!collapsed && (
                <span className="sidebar-section-title mt-6">
                  Monitoramento
                </span>
              )}
              <nav className="space-y-1">
                {monitorNavigation.map((item) => {
                  if (
                    !canAccess(item.permission) ||
                    !item.href
                  )
                    return null
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={clsx(
                        'nav-link',
                        matchesItem(item) && 'is-active'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {!collapsed && (
                        <span>{item.label}</span>
                      )}
                    </Link>
                  )
                })}
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
              <p>
                Crie automações para etapas repetitivas e
                libere tempo para o time.
              </p>
              <button>Configurar agora</button>
            </div>
          </div>
        )}
        <NavUser />
      </SidebarFooter>
    </motion.aside>
  )
}
