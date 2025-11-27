import GPDLLayout from '@/layouts/gpdl-layout';
import { BreadcrumbItem } from '@/types';
import { AdminTabs } from '@/components/admin-tabs';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '/admin' }];

export default function Index() {
  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
        <AdminTabs/>

      {/* Conteúdo Principal */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-8">Painel Administrativo</h1>

          {/* Mensagem de Boas-Vindas */}
          <div className="gpdl-card overflow-hidden border border-[var(--gpdl-border)] shadow-lg sm:rounded-lg bg-[var(--surface-card)] p-6">
            <p className="text-lg text-[var(--text-muted)]">Bem-vindo ao painel administrativo. Utilize a top bar acima para acessar as diferentes seções do sistema.</p>
          </div>
        </div>
      </div>
    </GPDLLayout>
  );
}
