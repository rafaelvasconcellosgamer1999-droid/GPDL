import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { AdminTabs } from '@/components/admin-tabs';
import { useState, FormEventHandler } from 'react';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    usuarioRede: string;
    cargo_id: number;
    setor_id: number | null;
    ativo: boolean;
    precisa_trocar_senha: boolean;
    data_criacao: string;
    cargo?: { id: number; nome: string };
    setor?: { id: number; nome: string; sigla?: string };
}

interface Cargo {
    id: number;
    nome: string;
}

interface Setor {
    id: number;
    nome: string;
    sigla?: string;
}

interface PaginatedData {
    data: Usuario[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Props {
    usuarios: PaginatedData;
    cargos: Cargo[];
    setores: Setor[];
    filters: {
        cargo_id?: string;
        setor_id?: string;
        status?: string;
    };
}

export default function Usuarios({ usuarios, cargos, setores, filters }: Props) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [senhaGerada, setSenhaGerada] = useState('');

    const { data: filterData, setData: setFilterData, get } = useForm({
        cargo_id: filters.cargo_id || '',
        setor_id: filters.setor_id || '',
        status: filters.status || '',
    });

    const { data: editData, setData: setEditData, post: postEdit, processing, errors, reset } = useForm({
        id: 0,
        cargo_id: '',
        setor_id: '',
    });

    const applyFilters = () => {
        get('/admin/usuarios', {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setFilterData({
            cargo_id: '',
            setor_id: '',
            status: '',
        });
        router.get('/admin/usuarios');
    };

    const openEditModal = (usuario: Usuario) => {
        setEditingUsuario(usuario);
        setEditData({
            id: usuario.id,
            cargo_id: usuario.cargo_id.toString(),
            setor_id: usuario.setor_id?.toString() || '',
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingUsuario(null);
        reset();
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        postEdit('/admin/usuarios/atualizar', {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const resetarSenha = (id: number, nome: string) => {
        if (confirm(`Resetar a senha de "${nome}"?\n\nUma nova senha temporária será gerada.`)) {
            router.post('/admin/usuarios/resetar-senha', 
                { id }, 
                { 
                    preserveScroll: true,
                    onSuccess: (page: any) => {
                        const senha = page.props.flash?.senha || 'Temp' + Math.floor(1000 + Math.random() * 9000);
                        setSenhaGerada(senha);
                        setShowResetModal(true);
                    }
                }
            );
        }
    };

    const toggleUsuario = (id: number, nome: string, ativo: boolean) => {
        const acao = ativo ? 'desabilitar' : 'habilitar';
        if (confirm(`Deseja ${acao} o usuário "${nome}"?`)) {
            const url = ativo ? '/admin/usuarios/desabilitar' : '/admin/usuarios/habilitar';
            router.post(url, { id }, { 
                preserveScroll: true,
                onSuccess: (page: any) => {
                    if (!ativo && page.props.flash?.senha) {
                        setSenhaGerada(page.props.flash.senha);
                        setShowResetModal(true);
                    }
                }
            });
        }
    };

    const excluirUsuario = (id: number, nome: string) => {
        if (confirm(`Deseja EXCLUIR permanentemente o usuário "${nome}"?\n\nEsta ação não pode ser desfeita!`)) {
            router.delete('/admin/usuarios/excluir', {
                data: { id },
                preserveScroll: true,
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const breadcrumbs = [
        { title: 'Administração', href: '/admin' },
        { title: 'Usuários', href: '/admin/usuarios' },
    ];

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs/>
            <Head title="Usuários - GPDL" />

            <div>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[var(--text-strong)]">
                            Usuários
                        </h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Gerencie os usuários do sistema
                        </p>
                    </div>

                    {/* Filtros */}
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cargo
                                </label>
                                <select
                                    value={filterData.cargo_id}
                                    onChange={(e) => setFilterData('cargo_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] text-sm"
                                >
                                    <option value="">Todos</option>
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Setor
                                </label>
                                <select
                                    value={filterData.setor_id}
                                    onChange={(e) => setFilterData('setor_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] text-sm"
                                >
                                    <option value="">Todos</option>
                                    {setores.map((setor) => (
                                        <option key={setor.id} value={setor.id}>
                                            {setor.nome} {setor.sigla ? `(${setor.sigla})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filterData.status}
                                    onChange={(e) => setFilterData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="ativos">Ativos</option>
                                    <option value="inativos">Inativos</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition text-sm"
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[var(--gpdl-border)]">
                                <thead className="bg-[var(--surface-muted)]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Usuário
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cargo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Setor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[var(--surface-card)] divide-y divide-[var(--gpdl-border)]">
                                    {usuarios.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Nenhum usuário encontrado com os filtros aplicados.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.data.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                                                {usuario.nome.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-[var(--text-strong)]">
                                                                {usuario.nome}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {usuario.usuarioRede} • {usuario.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-strong)]">
                                                    {usuario.cargo?.nome || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-strong)]">
                                                    {usuario.setor?.nome || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            usuario.ativo
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}>
                                                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                        {usuario.precisa_trocar_senha && (
                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                                Senha temp.
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => openEditModal(usuario)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-left"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                        <button
                                                            onClick={() => resetarSenha(usuario.id, usuario.nome)}
                                                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 text-left"
                                                        >
                                                            🔑 Resetar Senha
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUsuario(usuario.id, usuario.nome, usuario.ativo)}
                                                            className={`text-left ${
                                                                usuario.ativo 
                                                                    ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400'
                                                                    : 'text-green-600 hover:text-green-900 dark:text-green-400'
                                                            }`}
                                                        >
                                                            {usuario.ativo ? '🚫 Desabilitar' : '✅ Habilitar'}
                                                        </button>
                                                        <button
                                                            onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 text-left"
                                                        >
                                                            🗑️ Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {usuarios.last_page > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t dark:border-gray-700">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Mostrando {usuarios.data.length} de {usuarios.total} usuários
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: usuarios.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => router.get(`/admin/usuarios?page=${page}`)}
                                            className={`px-3 py-1 rounded ${
                                                page === usuarios.current_page
                                                    ? 'bg-[var(--brand-700)] text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Editar */}
            {showEditModal && editingUsuario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                                Editar Usuário
                            </h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <p className="text-sm font-medium text-[var(--text-strong)]">{editingUsuario.nome}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{editingUsuario.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cargo *
                                    </label>
                                    <select
                                        value={editData.cargo_id}
                                        onChange={(e) => setEditData('cargo_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)]"
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Setor
                                    </label>
                                    <select
                                        value={editData.setor_id}
                                        onChange={(e) => setEditData('setor_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)]"
                                    >
                                        <option value="">Nenhum</option>
                                        {setores.map((setor) => (
                                            <option key={setor.id} value={setor.id}>
                                                {setor.nome} {setor.sigla ? `(${setor.sigla})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Senha Gerada */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                                Senha Temporária Gerada
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                <code className="text-2xl font-bold text-[var(--brand-600)]">
                                    {senhaGerada}
                                </code>
                            </div>
                            <p className="text-sm text-[var(--text-muted)] mb-4">
                                Anote essa senha e repasse ao usuário.
                            </p>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="w-full px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)]"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GPDLLayout>
    );
}
