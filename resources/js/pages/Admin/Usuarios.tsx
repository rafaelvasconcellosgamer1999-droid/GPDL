import GPDLLayout from '@/layouts/gpdl-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { AdminTabs } from '@/components/admin-tabs';
import { useState, useMemo, FormEventHandler } from 'react';

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

const breadcrumbs = [
    { title: 'Admin', href: '/admin' },
    { title: 'Usuários', href: '/admin/usuarios' },
];

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

    // Contadores
    const counts = useMemo(() => {
        const active = usuarios.data.filter((u) => u.ativo).length;
        const tempPassword = usuarios.data.filter((u) => u.precisa_trocar_senha).length;
        return {
            total: usuarios.total,
            active,
            inactive: usuarios.data.length - active,
            tempPassword
        };
    }, [usuarios]);

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
            <Head title="Usuários - GPDL" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Usuários</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Gerencie usuários, atribua cargos e setores.
                        </p>

                        {/* Toolbar de filtros e contadores */}
                        <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
                            <div className="flex flex-wrap items-end gap-2">
                                {/* Cargo */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                                        Cargo
                                    </label>
                                    <select
                                        value={filterData.cargo_id}
                                        onChange={(e) => setFilterData('cargo_id', e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)] text-sm"
                                    >
                                        <option value="">Todos</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Setor */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                                        Setor
                                    </label>
                                    <select
                                        value={filterData.setor_id}
                                        onChange={(e) => setFilterData('setor_id', e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)] text-sm"
                                    >
                                        <option value="">Todos</option>
                                        {setores.map((setor) => (
                                            <option key={setor.id} value={setor.id}>
                                                {setor.nome} {setor.sigla ? `(${setor.sigla})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={filterData.status}
                                        onChange={(e) => setFilterData('status', e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)] text-sm"
                                    >
                                        <option value="">Todos</option>
                                        <option value="ativos">Ativos</option>
                                        <option value="inativos">Inativos</option>
                                    </select>
                                </div>

                                {/* Botões */}
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 rounded-lg bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] transition text-sm"
                                >
                                    Filtrar
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 rounded-lg bg-[var(--surface-muted)] text-[var(--text-strong)] hover:opacity-90 transition text-sm"
                                >
                                    Limpar
                                </button>
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
                                {counts.tempPassword > 0 && (
                                    <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                                        Senha temp.: <b>{counts.tempPassword}</b>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-xl border border-[var(--gpdl-border)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-[var(--surface-muted)] sticky top-0 z-10">
                                    <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-wider [&>th]:uppercase [&>th]:text-[var(--text-muted)]">
                                        <th>Usuário</th>
                                        <th>Cargo</th>
                                        <th>Setor</th>
                                        <th>Status</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--gpdl-border)]">
                                    {usuarios.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <p className="mt-2 text-[var(--text-muted)]">
                                                        Nenhum usuário encontrado com o filtro atual.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.data.map((usuario, idx) => (
                                            <tr
                                                key={usuario.id}
                                                className={idx % 2 === 1 ? 'bg-[color:var(--surface-main)/0.35]' : undefined}
                                            >
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                                                            <span className="text-white font-semibold text-sm">
                                                                {usuario.nome.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-[var(--text-strong)]">
                                                                {usuario.nome}
                                                            </div>
                                                            <div className="text-xs text-[var(--text-muted)]">
                                                                {usuario.usuarioRede} • {usuario.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-[var(--text-strong)]">
                                                    {usuario.cargo?.nome || <span className="text-[var(--text-muted)]">—</span>}
                                                </td>
                                                <td className="px-6 py-3 text-[var(--text-strong)]">
                                                    {usuario.setor?.nome || <span className="text-[var(--text-muted)]">—</span>}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span
                                                            className={[
                                                                'px-2.5 py-1 inline-flex text-xs font-semibold rounded-full w-fit',
                                                                usuario.ativo
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
                                                            ].join(' ')}
                                                        >
                                                            {usuario.ativo ? 'ATIVO' : 'INATIVO'}
                                                        </span>
                                                        {usuario.precisa_trocar_senha && (
                                                            <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 w-fit">
                                                                Senha temp.
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Editar */}
                                                        <button
                                                            onClick={() => openEditModal(usuario)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--gpdl-border)] hover:bg-[var(--surface-muted)] text-[var(--text-strong)] transition"
                                                            title="Editar usuário"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        {/* Resetar Senha */}
                                                        <button
                                                            onClick={() => resetarSenha(usuario.id, usuario.nome)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-300/60 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:text-purple-400 transition"
                                                            title="Resetar senha"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                            </svg>
                                                        </button>

                                                        {/* Toggle Ativo/Inativo */}
                                                        <button
                                                            onClick={() => toggleUsuario(usuario.id, usuario.nome, usuario.ativo)}
                                                            className={[
                                                                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition',
                                                                usuario.ativo
                                                                    ? 'border border-red-300/60 text-[var(--danger-500)] hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                    : 'border border-green-300/60 text-[var(--success-500)] hover:bg-green-50 dark:hover:bg-green-900/20',
                                                            ].join(' ')}
                                                            title={usuario.ativo ? 'Desabilitar' : 'Habilitar'}
                                                        >
                                                            {usuario.ativo ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                        </button>

                                                        {/* Excluir */}
                                                        <button
                                                            onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-300/60 text-[var(--danger-500)] hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                            title="Excluir usuário"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
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
                        <div className="px-6 py-4 border-t border-[var(--gpdl-border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <span>
                                Mostrando {usuarios.data.length} de {usuarios.total} {usuarios.total === 1 ? 'usuário' : 'usuários'}
                            </span>
                            {usuarios.last_page > 1 && (
                                <div className="flex gap-2">
                                    {Array.from({ length: usuarios.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => router.get(`/admin/usuarios?page=${page}`)}
                                            className={[
                                                'px-3 py-1 rounded text-xs transition',
                                                page === usuarios.current_page
                                                    ? 'bg-[var(--brand-700)] text-white'
                                                    : 'bg-[var(--surface-muted)] text-[var(--text-strong)] hover:bg-[var(--surface-muted)]/80',
                                            ].join(' ')}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Editar */}
            {showEditModal && editingUsuario && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={closeEditModal} />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-md rounded-2xl shadow-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] animate-scaleIn"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                                Editar usuário
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="p-2 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--text-muted)]"
                                title="Fechar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-4">
                                {/* Info do usuário */}
                                <div className="bg-[var(--surface-muted)] rounded-lg p-3">
                                    <p className="text-sm font-medium text-[var(--text-strong)]">
                                        {editingUsuario.nome}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {editingUsuario.email}
                                    </p>
                                </div>

                                {/* Cargo */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                                        Cargo <span className="text-[var(--danger-500)]">*</span>
                                    </label>
                                    <select
                                        value={editData.cargo_id}
                                        onChange={(e) => setEditData('cargo_id', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.nome}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cargo_id && (
                                        <p className="mt-1 text-xs text-[var(--danger-500)]">{errors.cargo_id}</p>
                                    )}
                                </div>

                                {/* Setor */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                                        Setor
                                    </label>
                                    <select
                                        value={editData.setor_id}
                                        onChange={(e) => setEditData('setor_id', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                                    >
                                        <option value="">Nenhum</option>
                                        {setores.map((setor) => (
                                            <option key={setor.id} value={setor.id}>
                                                {setor.nome} {setor.sigla ? `(${setor.sigla})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.setor_id && (
                                        <p className="mt-1 text-xs text-[var(--danger-500)]">{errors.setor_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 rounded-lg bg-[var(--surface-muted)] text-[var(--text-strong)] hover:opacity-90 transition"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] disabled:opacity-50 transition"
                                    disabled={processing}
                                >
                                    {processing ? 'Salvando…' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Senha Gerada */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={() => setShowResetModal(false)} />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-md rounded-2xl shadow-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] animate-scaleIn"
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                                Senha Temporária Gerada
                            </h3>
                            <div className="bg-[var(--surface-muted)] rounded-lg p-4 mb-4">
                                <code className="text-2xl font-bold text-[var(--brand-600)]">
                                    {senhaGerada}
                                </code>
                            </div>
                            <p className="text-sm text-[var(--text-muted)] mb-6">
                                Anote essa senha e repasse ao usuário. O usuário será solicitado a alterar a senha no primeiro login.
                            </p>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="w-full px-4 py-2 bg-[var(--brand-700)] text-white rounded-lg hover:bg-[var(--brand-600)] transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animações */}
            <style>{`
                .animate-fadeIn { animation: fadeIn .2s ease-out; }
                .animate-scaleIn { animation: scaleIn .18s ease-out; }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
            `}</style>
        </GPDLLayout>
    );
}
