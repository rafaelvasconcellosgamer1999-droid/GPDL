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
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setFilterData({
            cargo_id: '',
            setor_id: '',
            status: '',
        });
        router.get('/admin/usuarios', {
            preserveState: true,
        });
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
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const resetarSenha = (id: number, nome: string) => {
        if (confirm(`Resetar a senha de "${nome}"?\n\nUma nova senha temporária será gerada.`)) {
            router.post(
                '/admin/usuarios/resetar-senha',
                { id },
                {
                    preserveScroll: true,
                    onSuccess: (page: any) => {
                        const senha = page.props.flash?.senha || 'Temp' + Math.floor(1000 + Math.random() * 9000);
                        setSenhaGerada(senha);
                        setShowResetModal(true);
                    },
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
                },
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

    const copiarSenha = () => {
        navigator.clipboard.writeText(senhaGerada);
        alert('Senha copiada para a área de transferência!');
    };

    const navegarPagina = (page: number) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        
        if (filterData.cargo_id) params.append('cargo_id', filterData.cargo_id);
        if (filterData.setor_id) params.append('setor_id', filterData.setor_id);
        if (filterData.status) params.append('status', filterData.status);

        router.get(`/admin/usuarios?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const breadcrumbs = [
        { title: 'Administração', href: '/admin' },
        { title: 'Usuários', href: '/admin/usuarios' },
    ];

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
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
                                    className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] text-sm focus:ring-2 focus:ring-[var(--brand-500)] focus:border-transparent transition"
                                >
                                    <option value="">Todos os cargos</option>
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
                                    className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] text-sm focus:ring-2 focus:ring-[var(--brand-500)] focus:border-transparent transition"
                                >
                                    <option value="">Todos os setores</option>
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
                                    className="w-full px-3 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] text-sm focus:ring-2 focus:ring-[var(--brand-500)] focus:border-transparent transition"
                                >
                                    <option value="">Todos os status</option>
                                    <option value="ativos">Ativos</option>
                                    <option value="inativos">Inativos</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="flex-1 px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:ring-offset-2"
                                >
                                    Filtrar
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Informação de resultados */}
                    {usuarios.data.length > 0 && (
                        <div className="mb-4 text-sm text-[var(--text-muted)]">
                            Mostrando {((usuarios.current_page - 1) * usuarios.per_page) + 1} a {Math.min(usuarios.current_page * usuarios.per_page, usuarios.total)} de {usuarios.total} usuário(s)
                        </div>
                    )}

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
                                                <div className="flex flex-col items-center gap-2">
                                                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                                                    <p className="text-sm">Tente ajustar os filtros para encontrar usuários.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.data.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                                            <span className="text-white font-semibold text-sm">
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-[var(--text-strong)]">
                                                        {usuario.cargo?.nome || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-[var(--text-strong)]">
                                                        {usuario.setor ? (
                                                            <>
                                                                {usuario.setor.sigla || usuario.setor.nome}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">Sem setor</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.ativo
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
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(usuario)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                            title="Editar usuário"
                                                        >
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => resetarSenha(usuario.id, usuario.nome)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                                            title="Resetar senha"
                                                        >
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                            </svg>
                                                            Resetar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleUsuario(usuario.id, usuario.nome, usuario.ativo)}
                                                            className={`inline-flex items-center px-3 py-1.5 rounded-md transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${usuario.ativo
                                                                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 focus:ring-orange-500'
                                                                    : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 focus:ring-green-500'
                                                                }`}
                                                            title={usuario.ativo ? 'Desabilitar usuário' : 'Habilitar usuário'}
                                                        >
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {usuario.ativo ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                )}
                                                            </svg>
                                                            {usuario.ativo ? 'Desabilitar' : 'Habilitar'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                            title="Excluir usuário permanentemente"
                                                        >
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Excluir
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
                                    Página {usuarios.current_page} de {usuarios.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {/* Botão Primeira Página */}
                                    <button
                                        type="button"
                                        onClick={() => navegarPagina(1)}
                                        disabled={usuarios.current_page === 1}
                                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Primeira página"
                                    >
                                        ««
                                    </button>

                                    {/* Botão Anterior */}
                                    <button
                                        type="button"
                                        onClick={() => navegarPagina(usuarios.current_page - 1)}
                                        disabled={usuarios.current_page === 1}
                                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Página anterior"
                                    >
                                        «
                                    </button>

                                    {/* Números de Página */}
                                    {Array.from({ length: usuarios.last_page }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Mostra primeira, última, atual e 2 vizinhas
                                            return page === 1 ||
                                                page === usuarios.last_page ||
                                                Math.abs(page - usuarios.current_page) <= 2;
                                        })
                                        .map((page, index, array) => {
                                            // Adiciona "..." quando há gap
                                            const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                                            
                                            return (
                                                <div key={page} className="flex gap-2">
                                                    {showEllipsisBefore && (
                                                        <span className="px-3 py-1 text-gray-500">...</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => navegarPagina(page)}
                                                        className={`px-3 py-1 rounded transition ${page === usuarios.current_page
                                                                ? 'bg-[var(--brand-700)] text-white font-semibold'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </div>
                                            );
                                        })}

                                    {/* Botão Próximo */}
                                    <button
                                        type="button"
                                        onClick={() => navegarPagina(usuarios.current_page + 1)}
                                        disabled={usuarios.current_page === usuarios.last_page}
                                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Próxima página"
                                    >
                                        »
                                    </button>

                                    {/* Botão Última Página */}
                                    <button
                                        type="button"
                                        onClick={() => navegarPagina(usuarios.last_page)}
                                        disabled={usuarios.current_page === usuarios.last_page}
                                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Última página"
                                    >
                                        »»
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Editar */}
            {showEditModal && editingUsuario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeEditModal}>
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                                Editar Usuário
                            </h3>
                            <button 
                                type="button"
                                onClick={closeEditModal} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                    <p className="text-sm font-medium text-[var(--text-strong)]">{editingUsuario.nome}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{editingUsuario.email}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Usuário de rede: {editingUsuario.usuarioRede}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cargo <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.cargo_id}
                                        onChange={(e) => setEditData('cargo_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] focus:ring-2 focus:ring-[var(--brand-500)] focus:border-transparent transition"
                                        required
                                    >
                                        <option value="">Selecione um cargo</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                                        ))}
                                    </select>
                                    {errors.cargo_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cargo_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Setor
                                    </label>
                                    <select
                                        value={editData.setor_id}
                                        onChange={(e) => setEditData('setor_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-[var(--gpdl-border)] rounded-lg bg-white dark:bg-gray-700 text-[var(--text-strong)] focus:ring-2 focus:ring-[var(--brand-500)] focus:border-transparent transition"
                                    >
                                        <option value="">Nenhum setor</option>
                                        {setores.map((setor) => (
                                            <option key={setor.id} value={setor.id}>
                                                {setor.nome} {setor.sigla ? `(${setor.sigla})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.setor_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.setor_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:ring-offset-2"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Salvando...
                                        </span>
                                    ) : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Senha Gerada */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResetModal(false)}>
                    <div className="bg-[var(--surface-card)] rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-2">
                                Senha Temporária Gerada
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] mb-4">
                                A senha foi gerada com sucesso. Anote e repasse ao usuário.
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <code className="text-2xl font-bold text-[var(--brand-600)] select-all">
                                    {senhaGerada}
                                </code>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={copiarSenha}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copiar
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:ring-offset-2"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </GPDLLayout>
    );
}