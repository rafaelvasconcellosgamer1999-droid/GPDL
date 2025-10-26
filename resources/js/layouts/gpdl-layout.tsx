import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { GpdlSidebar } from '@/components/gpdl-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface GpdlLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function GpdlLayout({ children, breadcrumbs = [] }: PropsWithChildren<GpdlLayoutProps>) {
    return (
        <AppShell variant="sidebar">
            {/* Sidebar customizada do GPDL */}
            <GpdlSidebar />

            {/* Conteúdo principal */}
            <AppContent
  variant="sidebar"
  className="overflow-x-hidden bg-[var(--surface-main)] gpdl-background gpdl-main-content"
>
                {/* Header com breadcrumbs */}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                {/* Conteúdo da página */}
                <div id="page-content" className="flex-1 p-8 flex flex-col gap-8 min-h-[80vh]">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
