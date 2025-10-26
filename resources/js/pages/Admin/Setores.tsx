import GPDLLayout from '@/layouts/gpdl-layout';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEventHandler } from 'react';

interface Setor {
    id: number;
    nome: string;
    sigla: string;
    ativo: boolean;
}

interface Props {
    setores: Setor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Setores', href: '/admin/setores' },
];

export default function Setores({ setores }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingSetor, setEditingSetor] = useState<Setor | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: 0,
        nome: '',
        sigla: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingSetor(null);
        setShowModal(true);
    };

    const openEditModal = (setor: Setor) => {
        setEditingSetor(setor);
        setData({
            id: setor.id,
            nome: setor.nome,
            sigla: setor.sigla || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
        setEditingSetor(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingSetor) {
            post('/admin/setores/editar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/setores/criar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleStatus = (id: number) => {
    if (confirm('Deseja alterar o status deste setor?')) {
        router.post('/admin/setores/toggle', 
            { id }, 
            { preserveScroll: true }
        );
    }
};

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
            <Head title="Setores - GPDL" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-strong)]">
                                Setores
                            </h1>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Crie e remova setores organizacionais
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo setor
                        </button>
                    </div>

                    {/* Tabela */}
                    <div className="bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                                Setores cadastrados
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                                    <thead>
                                        <tr className="bg-[var(--surface-muted)]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Nome
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Sigla
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[var(--surface-card)] divide-y divide-[var(--gpdl-border)]">
                                        {setores.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-[var(--text-muted)]">
                                                    Nenhum setor cadastrado
                                                </td>
                                            </tr>
                                        ) : (
                                            setores.map((setor) => (
                                                <tr key={setor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-strong)]">
                                                        {setor.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[var(--text-strong)]">
                                                        {setor.nome}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-strong)]">
                                                        {setor.sigla || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            setor.ativo
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}>
                                                            {setor.ativo ? 'ATIVO' : 'INATIVO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(setor)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            <span className="ml-1">Salvar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStatus(setor.id)}
                                                            className={`${
                                                                setor.ativo
                                                                    ? 'text-[var(--danger-500)] hover:text-red-900 dark:text-red-400'
                                                                    : 'text-[var(--success-500)] hover:text-green-900 dark:text-green-400'
                                                            }`}
                                                        >
                                                            <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            <span className="ml-1">
                                                                {setor.ativo ? 'Desativar' : 'Ativar'}
                                                            </span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                Página 1 de 1
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-md w-full">
                        {/* Header do Modal */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                                {editingSetor ? 'Editar Setor' : 'Novo Setor'}
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

                        {/* Corpo do Modal */}
                        <form onSubmit={submit}>
                            <div className="p-6 space-y-4">
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nome do Setor *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent"
                                        placeholder="Ex: Diretoria de Tecnologia"
                                        required
                                    />
                                    {errors.nome && (
                                        <p className="mt-1 text-sm text-[var(--danger-500)] dark:text-red-400">{errors.nome}</p>
                                    )}
                                </div>

                                {/* Sigla */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sigla
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sigla}
                                        onChange={(e) => setData('sigla', e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent"
                                        placeholder="Ex: DTI"
                                        maxLength={20}
                                    />
                                    {errors.sigla && (
                                        <p className="mt-1 text-sm text-[var(--danger-500)] dark:text-red-400">{errors.sigla}</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer do Modal */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition disabled:opacity-50"
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
