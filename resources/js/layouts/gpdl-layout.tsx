import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { GpdlSidebar } from '@/components/gpdl-sidebar';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useState, type PropsWithChildren } from 'react';

interface GpdlLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
}

export default function GpdlLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<GpdlLayoutProps>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('gpdl_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    const handleSidebarToggle = () => {
      const collapsed =
        localStorage.getItem('gpdl_sidebar_collapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };

    window.addEventListener('sidebar:toggle', handleSidebarToggle);
    return () =>
      window.removeEventListener('sidebar:toggle', handleSidebarToggle);
  }, []);

  return (
    <AppShell variant="sidebar">
      <GpdlSidebar />
      <AppContent
        variant="sidebar"
        className="overflow-x-hidden bg-(--surface-main) gpdl-background"
        style={{
          marginLeft: sidebarCollapsed ? '80px' : '260px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        <div
          id="page-content"
          className="flex min-h-screen flex-1 flex-col gap-8 p-8"
        >
          {children}
        </div>
      </AppContent>
    </AppShell>
  );
}
