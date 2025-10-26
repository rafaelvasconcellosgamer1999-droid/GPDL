import GPDLLayout from '@/layouts/gpdl-layout';
import { type BreadcrumbItem } from '@/types';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';

interface Permissao {
    id: number;
    nome: string;
    descricao: string;
}

interface Props {
    permissoes: Permissao[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '/admin' }, { title: 'Permisses', href: '/admin/permissoes' }];
export default function Permissoes({ permissoes }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingPermissao, setEditingPermissao] = useState<Permissao | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: 0,
        nome: '',
        descricao: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingPermissao(null);
        setShowModal(true);
    };

    const openEditModal = (permissao: Permissao) => {
        setEditingPermissao(permissao);
        setData({
            id: permissao.id,
            nome: permissao.nome,
            descricao: permissao.descricao || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
        setEditingPermissao(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingPermissao) {
            post('/admin/permissoes/editar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/permissoes/criar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const deletePermissao = (id: number, nome: string) => {
        if (confirm(`Deseja realmente excluir a permissão "${nome}"?\n\nAtenção: Todas as regras vinculadas a esta permissão serão removidas!`)) {
            router.delete('/admin/permissoes/excluir', {
                data: { id },
                preserveScroll: true,
            });
        }
    };

    // Sugestões de permissões comuns
    const permissoesSugeridas = [
        { nome: 'view_dashboard', descricao: 'Visualizar dashboard' },
        { nome: 'view_process', descricao: 'Visualizar processos' },
        { nome: 'create_process', descricao: 'Criar processos' },
        { nome: 'edit_process', descricao: 'Editar processos' },
        { nome: 'delete_process', descricao: 'Excluir processos' },
        { nome: 'finalize_process', descricao: 'Finalizar processos' },
        { nome: 'import_process', descricao: 'Importar processos em lote' },
        { nome: 'export_process', descricao: 'Exportar processos' },
        { nome: 'view_reports', descricao: 'Visualizar relatórios' },
        { nome: 'view_admin', descricao: 'Acessar painel administrativo' },
        { nome: 'manage_users', descricao: 'Gerenciar usuários' },
        { nome: 'manage_permissions', descricao: 'Gerenciar permissões' },
        { nome: 'manage_rules', descricao: 'Gerenciar regras' },
    ];

    const usarSugestao = (sugestao: { nome: string; descricao: string }) => {
        setData({
            id: 0,
            nome: sugestao.nome,
            descricao: sugestao.descricao,
        });
    };

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
            <Head title="Permissões" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-strong)]">
                                Permissões
                            </h1>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Gerencie as permissões disponíveis no sistema
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nova permissão
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mb-6 bg-[var(--accent-info-soft)] border border-[var(--accent-info-border)] rounded-lg p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-[var(--accent-info)] mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Como funciona:</strong> As permissões definem o que um usuário pode fazer no sistema. 
                                    Depois de criar as permissões, você as vincula aos cargos através das <strong>Regras</strong>, 
                                    especificando também o <strong>escopo</strong> (próprio/setor/todos).
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                                    Exemplo: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">view_process</code> permite visualizar processos
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                                Permissões cadastradas
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                                    <thead>
                                        <tr className="bg-[var(--surface-muted)]">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Nome (Código)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Descrição
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[var(--surface-card)] divide-y divide-[var(--gpdl-border)]">
                                        {permissoes.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    <h3 className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                                                        Nenhuma permissão cadastrada
                                                    </h3>
                                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                        Comece criando uma nova permissão.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            permissoes.map((permissao) => (
                                                <tr key={permissao.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-strong)]">
                                                        {permissao.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-[var(--accent-info)] rounded font-mono text-xs">
                                                            {permissao.nome}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[var(--text-strong)]">
                                                        {permissao.descricao || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                                        <button
                                                            onClick={() => openEditModal(permissao)}
                                                            className=\"text-[var(--brand-600)] hover:opacity-80 inline-flex items-center\"
                                                        >
                                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => deletePermissao(permissao.id, permissao.nome)}
                                                            className=\"text-[var(--danger-500)] hover:opacity-80 inline-flex items-center\"
                                                        >
                                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
                                Página 1 de 1 • {permissoes.length} {permissoes.length === 1 ? 'permissão' : 'permissões'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header do Modal */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 sticky top-0 bg-[var(--surface-card)]">
                            <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                                {editingPermissao ? 'Editar Permissão' : 'Nova Permissão'}
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
                                {/* Nome (Código) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nome (Código) *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={(e) => setData('nome', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                        placeholder="Ex: view_dashboard, manage_users"
                                        required
                                    />
                                    {errors.nome && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nome}</p>
                                    )}
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        Use snake_case (minúsculas com underline). Ex: view_process, create_user
                                    </p>
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Descrição
                                    </label>
                                    <input
                                        type="text"
                                        value={data.descricao}
                                        onChange={(e) => setData('descricao', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Permite visualizar o dashboard"
                                    />
                                    {errors.descricao && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descricao}</p>
                                    )}
                                </div>

                                {/* Sugestões */}
                                {!editingPermissao && (
                                    <div className="border-t dark:border-gray-700 pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            📌 Sugestões de permissões comuns:
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                            {permissoesSugeridas.map((sugestao, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => usarSugestao(sugestao)}
                                                    className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                                >
                                                    <code className="text-xs text-[var(--accent-info)] font-mono block">
                                                        {sugestao.nome}
                                                    </code>
                                                    <p className="text-xs text-[var(--text-muted)] mt-1">
                                                        {sugestao.descricao}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer do Modal */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700 bg-[var(--surface-muted)]">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
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
