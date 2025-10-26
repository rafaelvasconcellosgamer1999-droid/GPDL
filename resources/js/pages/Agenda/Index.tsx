import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';

export default function AgendaIndex() {
    const breadcrumbs = [{ title: 'Agenda', href: '/agenda' }];
    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-strong)]">Agenda</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Visão de calendário e tarefas (placeholder)</p>
                </div>
            </div>

            <div className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm min-h-[360px] flex items-center justify-center">
                <p className="text-[var(--text-muted)]">Calendário será renderizado aqui…</p>
            </div>
        </GPDLLayout>
    );
}

