import GPDLLayout from '@/layouts/gpdl-layout';
import { Head } from '@inertiajs/react';

export default function SquadsIndex() {
    const breadcrumbs = [{ title: 'Squads', href: '/squads' }];
    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <Head title="Squads" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-strong)]">Squads</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Estrutura de times (placeholder)</p>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {[1,2,3].map((i) => (
                    <div key={i} className="bg-[var(--surface-card)] p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="shortcut-icon is-blue"><i className="fas fa-users"></i></div>
                            <div>
                                <h3 className="text-[var(--text-strong)] font-semibold">Squad {i}</h3>
                                <p className="text-[var(--text-muted)] text-sm">3 membros</p>
                            </div>
                        </div>
                        <ul className="text-sm text-[var(--text-muted)] list-disc ml-4">
                            <li>Integrante A</li>
                            <li>Integrante B</li>
                            <li>Integrante C</li>
                        </ul>
                    </div>
                ))}
            </div>
        </GPDLLayout>
    );
}

