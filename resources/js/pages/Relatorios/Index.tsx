import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';

export default function RelatoriosIndex() {
    const breadcrumbs = [{ title: 'Relatórios', href: '/relatorios' }];
    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <Head title="Relatórios" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-strong)]">Relatórios</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Filtros e resultados (placeholder)</p>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-[var(--surface-card)] p-4 rounded-lg shadow-sm md:col-span-1">
                    <h3 className="text-sm font-medium text-[var(--text-strong)] mb-3">Filtros</h3>
                    <div className="space-y-3">
                        <select className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg">
                            <option>Tipo</option>
                        </select>
                        <input className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg" placeholder="Período" />
                        <button className="w-full px-3 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)]">Aplicar</button>
                    </div>
                </div>
                <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm md:col-span-3 min-h-[260px]">
                    <p className="text-[var(--text-muted)]">Resultados do relatório serão exibidos aqui…</p>
                </div>
            </div>
        </GPDLLayout>
    );
}

