import GPDLLayout from '@/layouts/gpdl-layout';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState, useMemo, FormEventHandler } from 'react';

interface Cargo {
    id: number;
    nome: string;
    usuarios_count?: number;
    status: boolean;
}

interface Props {
    cargos: Cargo[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Cargos', href: '/admin/cargos' },
];

type StatusFilter = 'all' | 'active' | 'inactive';

export default function Cargos({ cargos }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const { data, setData, post, processing, errors, reset } = useForm({
        id: 0,
        nome: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingCargo(null);
        setShowModal(true);
    };

    const openEditModal = (cargo: Cargo) => {
        setEditingCargo(cargo);
        setData({
            id: cargo.id,
            nome: cargo.nome,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
        setEditingCargo(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingCargo) {
            post('/admin/cargos/editar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/cargos/criar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteCargo = (id: number, nome: string, usuariosCount: number) => {
        if (usuariosCount > 0) {
            alert(`Não é possível excluir o cargo "${nome}" pois existem ${usuariosCount} usuário(s) vinculado(s).`);
            return;
        }

        if (confirm(`Deseja realmente excluir o cargo "${nome}"?`)) {
            router.delete('/admin/cargos/excluir', {
                data: { id },
                preserveScroll: true,
            });
        }
    };

    // Função para alternar o status do cargo
    const toggleStatus = (id: number) => {
        if (confirm('Deseja alterar o status deste cargo?')) {
            router.post('/admin/cargos/toggle', { id }, { preserveScroll: true });
        }
    };

    // ---- Filtro/Busca client-side ----
    const counts = useMemo(() => {
        const active = cargos.filter((c) => c.status).length;
        return { total: cargos.length, active, inactive: cargos.length - active };
    }, [cargos]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return cargos
            .filter((c) => {
                if (statusFilter === 'active' && !c.status) return false;
                if (statusFilter === 'inactive' && c.status) return false;
                if (!q) return true;
                return (
                    c.nome.toLowerCase().includes(q) ||
                    String(c.id).includes(q)
                );
            })
            .sort((a, b) => a.nome.localeCompare(b.nome));
    }, [cargos, query, statusFilter]);

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
            <Head title="Cargos - GPDL" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between gap-4">
                                <div>
                            <h1 className="text-2xl font-bold text-[var(--text-strong)]">Cargos</h1>
                            <p className="text-sm text-[var(--text-muted)] mt-1">Gerencie os cargos do sistema</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo cargo
                        </button>
                        </div>
                    </div>

                    {/* Barra de Filtro e Busca */}
                    <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                            {/* Campo de busca */}
                            <div className="relative">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Buscar por nome ou ID..."
                                    className="w-72 max-w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                                />
                                <svg
                                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                                </svg>
                            </div>

                            {/* Filtro de Status */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="px-3 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                                title="Filtrar por status"
                            >
                                <option value="all">Todos</option>
                                <option value="active">Ativos</option>
                                <option value="inactive">Inativos</option>
                            </select>
                        </div>

                        {/* Contadores */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                                Total: <b className="text-[var(--text-strong)]">{counts.total}</b>
                            </span>
                            <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                Ativos: <b>{counts.active}</b>
                            </span>
                            <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
                                Inativos: <b>{counts.inactive}</b>
                            </span>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="mt-6 bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-xl border border-[var(--gpdl-border)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                                <thead className="bg-[var(--surface-muted)] sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuários</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--gpdl-border)]">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Nenhum cargo encontrado com o filtro atual.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((cargo) => (
                                            <tr key={cargo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-strong)]">{cargo.id}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-strong)]">{cargo.nome}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {cargo.usuarios_count || 0} {cargo.usuarios_count === 1 ? 'usuário' : 'usuários'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={[
                                                            'px-2.5 py-1 inline-flex text-xs font-semibold rounded-full',
                                                            cargo.status
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
                                                        ].join(' ')}
                                                    >
                                                        {cargo.status ? 'ATIVO' : 'INATIVO'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                                    <button
                                                        onClick={() => openEditModal(cargo)}
                                                        className="text-[var(--brand-600)] hover:opacity-80 inline-flex items-center"
                                                    >
                                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCargo(cargo.id, cargo.nome, cargo.usuarios_count || 0)}
                                                        className="text-[var(--danger-500)] hover:opacity-80 inline-flex items-center"
                                                    >
                                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Excluir
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(cargo.id)}
                                                        className={[
                                                            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition',
                                                            cargo.status
                                                                ? 'border border-red-300/60 text-[var(--danger-500)] hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                : 'border border-green-300/60 text-[var(--success-500)] hover:bg-green-50 dark:hover:bg-green-900/20',
                                                        ].join(' ')}
                                                        title={cargo.status ? 'Desativar' : 'Ativar'}
                                                    >
                                                        {cargo.status ? (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Desativar</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Ativar</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação (placeholder) */}
                        <div className="px-6 py-4 border-t border-[var(--gpdl-border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <span>Mostrando {filtered.length} de {counts.total}</span>
                            <span>Página 1 de 1</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-md w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                                {editingCargo ? 'Editar Cargo' : 'Novo Cargo'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={submit}>
                            <div className="p-6 space-y-4">
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-strong)] mb-2">
                                        Nome do Cargo <span className="text-[var(--danger-500)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-white dark:bg-gray-700 text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                                        placeholder="Ex: Procurador, Analista, etc."
                                        required
                                    />
                                    {errors.nome && (
                                        <p className="mt-1 text-sm text-[var(--danger-500)]">{errors.nome}</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-[var(--text-strong)] bg-[var(--surface-muted)] rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] disabled:opacity-50 transition"
                                    disabled={processing}
                                >
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </GPDLLayout>
    );
}
