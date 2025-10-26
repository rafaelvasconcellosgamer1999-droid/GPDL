import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';

export default function AuditoriaIndex() {
    const breadcrumbs = [{ title: 'Auditoria', href: '/auditoria' }];
    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <Head title="Auditoria" />
            <h1 className="text-2xl font-bold text-[var(--text-strong)]">Auditoria</h1>
            <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                        <thead>
                            <tr className="bg-[var(--surface-muted)]">
                                <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Data</th>
                                <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Usuário</th>
                                <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Ação</th>
                                <th className="px-4 py-2 text-left text-xs text-[var(--text-muted)] uppercase">Origem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--gpdl-border)]">
                            {[1,2,3].map((i) => (
                                <tr key={i} className="hover:bg-[var(--surface-muted)]">
                                    <td className="px-4 py-2 text-sm">2025-10-25 10:{20 + i}</td>
                                    <td className="px-4 py-2 text-sm">Usuário {i}</td>
                                    <td className="px-4 py-2 text-sm">Atualizou processo</td>
                                    <td className="px-4 py-2 text-sm">/processos</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </GPDLLayout>
    );
}

