import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';

export default function LogsIndex() {
    const breadcrumbs = [{ title: 'Logs', href: '/logs' }];
    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <Head title="Logs do Sistema" />
            <h1 className="text-2xl font-bold text-(--text-strong)">Logs do Sistema</h1>
            <div className="bg-(--surface-card) p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-(--gpdl-border)">
                        <thead>
                            <tr className="bg-(--surface-muted)">
                                <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Data</th>
                                <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Nível</th>
                                <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Mensagem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--gpdl-border)">
                            {[1,2,3,4].map((i) => (
                                <tr key={i} className="hover:bg-(--surface-muted)">
                                    <td className="px-4 py-2 text-sm">2025-10-25 09:{10 + i}</td>
                                    <td className="px-4 py-2 text-sm"><span className="gpdl-badge">INFO</span></td>
                                    <td className="px-4 py-2 text-sm">Placeholder de log {i}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </GPDLLayout>
    );
}

