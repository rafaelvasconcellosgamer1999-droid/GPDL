import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, Link } from '@inertiajs/react';
import { AdminTabs } from '@/components/admin-tabs';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '/admin' }];

export default function Index({ stats }: { stats: any }) {
  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin - GPDL" />

      <div className="py-2">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-8">Painel Administrativo</h1>

          {/* Cards de estatisticas */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Usuarios */}
            <div className="gpdl-card overflow-hidden border border-[var(--gpdl-border)] shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Usuarios</p>
                    <p className="text-3xl font-bold text-[var(--text-strong)]">{stats.usuarios}</p>
                  </div>
                  <div className="p-3 bg-[var(--accent-info-soft)] rounded-full">
                    <svg className="w-8 h-8 text-[var(--accent-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <Link href="/admin/usuarios" className="mt-4 text-sm gpdl-link">Ver todos ?</Link>
              </div>
            </div>

            {/* Setores */}
            <div className="gpdl-card overflow-hidden border border-[var(--gpdl-border)] shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Setores</p>
                    <p className="text-3xl font-bold text-[var(--text-strong)]">{stats.setores}</p>
                  </div>
                  <div className="p-3 bg-[var(--accent-success-soft)] rounded-full">
                    <svg className="w-8 h-8 text-[var(--accent-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <Link href="/admin/setores" className="mt-4 text-sm gpdl-link">Gerenciar ?</Link>
              </div>
            </div>

            {/* Cargos */}
            <div className="gpdl-card overflow-hidden border border-[var(--gpdl-border)] shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Cargos</p>
                    <p className="text-3xl font-bold text-[var(--text-strong)]">{stats.cargos}</p>
                  </div>
                  <div className="p-3 bg-[var(--accent-info-soft)] rounded-full">
                    <svg className="w-8 h-8 text-[var(--accent-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <Link href="/admin/cargos" className="mt-4 text-sm gpdl-link">Gerenciar ?</Link>
              </div>
            </div>

            {/* Solicitaes pendentes */}
            <div className="gpdl-card overflow-hidden border border-[var(--gpdl-border)] shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Solicitacoes pendentes</p>
                    <p className="text-3xl font-bold text-[var(--text-strong)]">{stats.solicitacoes_pendentes}</p>
                  </div>
                  <div className="p-3 bg-[var(--accent-warning-soft)] rounded-full">
                    <svg className="w-8 h-8 text-[var(--accent-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <Link href="/admin/solicitacoes" className="mt-4 text-sm gpdl-link">Ver pendentes ?</Link>
              </div>
            </div>
          </div>

          {/* Aes rpidas */}
          <div className="gpdl-card overflow-hidden border border-[var(--gpdl-border)] shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">Aes Rpidas</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/usuarios" className="flex items-center p-4 bg-[var(--surface-muted)] rounded-lg hover:shadow-[var(--shadow-card)] transition">
                  <svg className="w-6 h-6 text-[var(--brand-600)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-[var(--text-strong)]">Gerenciar usuarios</span>
                </Link>

                <Link href="/admin/setores" className="flex items-center p-4 bg-[var(--surface-muted)] rounded-lg hover:shadow-[var(--shadow-card)] transition">
                  <svg className="w-6 h-6 text-[var(--success-500)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-[var(--text-strong)]">Gerenciar setores</span>
                </Link>

                <Link href="/admin/cargos" className="flex items-center p-4 bg-[var(--surface-muted)] rounded-lg hover:shadow-[var(--shadow-card)] transition">
                  <svg className="w-6 h-6 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[var(--text-strong)]">Gerenciar cargos</span>
                </Link>

                <Link href="/admin/solicitacoes" className="flex items-center p-4 bg-[var(--surface-muted)] rounded-lg hover:shadow-[var(--shadow-card)] transition">
                  <svg className="w-6 h-6 text-[var(--warning-500)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[var(--text-strong)]">Aprovar solicitacoes</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GPDLLayout>
  );
}

