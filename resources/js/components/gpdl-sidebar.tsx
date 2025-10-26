import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
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
} from 'lucide-react';
import AppLogo from './app-logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface Permission {
    view_dashboard?: string;
    view_process?: string;
    create_process?: string;
    edit_process?: string;
    finalize_process?: string;
    view_agenda?: string;
    view_reports?: string;
    view_admin?: string;
    view_squads?: string;
    manage_squads?: string;
    view_logs?: string;
    view_audit?: string;
}

export function GpdlSidebar() {
    const { permissions } = usePage().props as { permissions?: Permission };
    // Fallback sem Ziggy: usa URL atual para estado ativo
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const currentView = searchParams.get('view') || undefined;

    // Helpers para verificar permissões
    const can = (permission: keyof Permission, levels?: string[]) => {
        // Sem permissões fornecidas, mostramos tudo para fins de estrutura/preview
        if (!permissions) return true;
        if (!permissions[permission]) return false;
        if (!levels) return true;
        return levels.some((level) => permissions[permission]?.includes(level));
    };

    const isActive = (routeName: string, view?: string) => {
        if (view && currentView) {
            return pathname.includes(routeName) && currentView === view;
        }
        return pathname.includes(routeName);
    };

    const processSubmenuOpen = pathname.includes('processos');

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="bg-[var(--gpdl-sidebar)]">
            {/* HEADER */}
            <SidebarHeader className="border-b border-white/10">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-white/10">
                            <Link href={dashboard()} prefetch>
                                <div className="flex items-center gap-3">
                                    <div className="brand-icon">
                                        <LayoutDashboard className="h-5 w-5" />
                                    </div>
                                    <div className="brand-copy">
                                        <span className="text-xs text-white/70 uppercase tracking-wider">
                                            Gerenciador
                                        </span>
                                        <strong className="text-white font-semibold">Processos</strong>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent className="px-3 py-4">
                {/* SEÇÃO PRINCIPAL */}
                <div className="mb-6">
                    <span className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                        Principal
                    </span>
                    <nav className="space-y-1">
                        {/* Dashboard */}
                        {can('view_dashboard', ['own', 'sector', 'all']) && (
                            <Link
                                href={dashboard()}
                                className={`nav-link ${isActive('dashboard') ? 'is-active' : ''}`}
                            >
                                <Home className="h-4 w-4" />
                                <span>Início</span>
                            </Link>
                        )}

                        {/* Processos com Submenu */}
                        {can('view_process', ['own', 'sector', 'all']) && (
                            <Collapsible defaultOpen={processSubmenuOpen}>
                                <CollapsibleTrigger className="nav-link w-full">
                                    <FileText className="h-4 w-4" />
                                    <span className="flex-1">Processos</span>
                                    <svg
                                        className="caret h-4 w-4 transition-transform"
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
                                    </svg>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="nav-sub">
                                    {can('create_process', ['sector', 'all']) && (
                                        <Link
                                            href="/processos?view=cadastro"
                                            className={`nav-link ${isActive('processos', 'cadastro') ? 'is-active' : ''}`}
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Cadastrar</span>
                                        </Link>
                                    )}
                                    <Link
                                        href="/processos?view=ativos"
                                        className={`nav-link ${isActive('processos', 'ativos') ? 'is-active' : ''}`}
                                    >
                                        <FileText className="h-4 w-4" />
                                        <span>Ativos</span>
                                    </Link>
                                    <Link
                                        href="/processos?view=pendentes"
                                        className={`nav-link ${isActive('processos', 'pendentes') ? 'is-active' : ''}`}
                                    >
                                        <TriangleAlert className="h-4 w-4" />
                                        <span>Pendentes</span>
                                    </Link>
                                    <Link
                                        href="/processos?view=vencidos"
                                        className={`nav-link ${isActive('processos', 'vencidos') ? 'is-active' : ''}`}
                                    >
                                        <TriangleAlert className="h-4 w-4" />
                                        <span>Vencidos</span>
                                    </Link>
                                    {can('edit_process', ['sector', 'all']) && (
                                        <Link
                                            href="/processos?view=distribuicao"
                                            className={`nav-link ${isActive('processos', 'distribuicao') ? 'is-active' : ''}`}
                                        >
                                            <Share2 className="h-4 w-4" />
                                            <span>Distribuição</span>
                                        </Link>
                                    )}
                                    {can('finalize_process', ['sector', 'all']) && (
                                        <Link
                                            href="/processos?view=encerrados"
                                            className={`nav-link ${isActive('processos', 'encerrados') ? 'is-active' : ''}`}
                                        >
                                            <Lock className="h-4 w-4" />
                                            <span>Finalizados</span>
                                        </Link>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        )}

                        {/* Agenda */}
                        {can('view_agenda', ['own', 'sector', 'all']) && (
                            <Link href="/agenda" className={`nav-link ${isActive('agenda') ? 'is-active' : ''}`}>
                                <Calendar className="h-4 w-4" />
                                <span>Agenda</span>
                            </Link>
                        )}

                        {/* Relatórios */}
                        {can('view_reports', ['own', 'sector', 'all']) && (
                            <Link
                                href="/relatorios"
                                className={`nav-link ${isActive('relatorios') ? 'is-active' : ''}`}
                            >
                                <ChartPie className="h-4 w-4" />
                                <span>Relatórios</span>
                            </Link>
                        )}

                        {/* Administração */}
                        {can('view_admin', ['all']) && (
                            <Link href="/admin" className={`nav-link ${isActive('admin') ? 'is-active' : ''}`}>
                                <Shield className="h-4 w-4" />
                                <span>Administração</span>
                            </Link>
                        )}

                        {/* Squads */}
                        {(can('view_squads', ['sector', 'all']) || can('manage_squads', ['all'])) && (
                            <Link href="/squads" className={`nav-link ${isActive('squads') ? 'is-active' : ''}`}>
                                <Users className="h-4 w-4" />
                                <span>Squads</span>
                            </Link>
                        )}
                    </nav>
                </div>

                {/* SEÇÃO MONITORAMENTO */}
                {(can('view_logs', ['all']) || can('view_audit', ['all'])) && (
                    <div className="mb-6">
                        <span className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                            Monitoramento
                        </span>
                        <nav className="space-y-1">
                            {can('view_logs', ['all']) && (
                                <Link href="/logs" className="nav-link">
                                    <Shield className="h-4 w-4" />
                                    <span>Logs do Sistema</span>
                                </Link>
                            )}
                            {can('view_audit', ['all']) && (
                                <Link href="/auditoria" className="nav-link">
                                    <Shield className="h-4 w-4" />
                                    <span>Auditoria</span>
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="border-t border-white/10">
                {/* Card Promocional */}
                <div className="p-4 mb-2">
                    <div className="sidebar-card bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <h3 className="text-white font-semibold text-sm mb-2">Fluxos mais rápidos</h3>
                        <p className="text-white/70 text-xs mb-3">
                            Crie automações para etapas repetitivas e libere tempo para o time.
                        </p>
                        <button className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs rounded-md transition-colors flex items-center justify-center gap-2">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                            </svg>
                            Configurar agora
                        </button>
                    </div>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
