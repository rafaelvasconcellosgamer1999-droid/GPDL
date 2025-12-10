import { AdminTabs } from '@/components/admin-tabs';
import GPDLLayout from '@/layouts/gpdl-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback, useEffect, useState } from 'react';

interface Regra {
    id: number;
    cargo_id: number;
    permissao_id: number;
    scope_id: number | null;
    setor_id: number | null;
    cargo?: { id: number; nome: string };
    permissao?: { id: number; nome: string; descricao?: string };
    scope?: { id: number; nome: string };
    setor?: { id: number; nome: string; sigla?: string };
}

interface Cargo {
    id: number;
    nome: string;
}

interface Permissao {
    id: number;
    nome: string;
    descricao?: string;
}

interface Scope {
    id: number;
    nome: string;
    descricao?: string;
}

interface Setor {
    id: number;
    nome: string;
    sigla?: string;
}

interface Props {
    regras: Regra[];
    cargos: Cargo[];
    permissoes: Permissao[];
    scopes: Scope[];
    setores: Setor[];
    filters: {
        cargo_id?: string;
        permissao_id?: string;
        scope_id?: string;
        setor_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Regras', href: '/admin/regras' },
];

export default function Regras({
    regras,
    cargos,
    permissoes,
    scopes,
    setores,
    filters,
}: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingRegra, setEditingRegra] = useState<Regra | null>(null);

    // Filtro
    const { data: filterData, setData: setFilterData } = useForm({
        cargo_id: filters.cargo_id || '',
        permissao_id: filters.permissao_id || '',
        scope_id: filters.scope_id || '',
        setor_id: filters.setor_id || '',
    });

    // Form principal (criação / edição)
    const { data, setData, processing, errors, reset } = useForm({
        id: 0,
        cargo_id: 0,
        permissao_id: 0,
        scope_id: null as number | null,
        setor_id: null as number | null,
        setor_especifico: false, // 👈 novo campo de controle do checkbox
    });

    /** 🔎 Aplica filtro de cargo */
    const applyFilters = () => {
        router.get('/admin/regras', filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    /** 🔄 Limpa filtros */
    const clearFilters = () => {
        setFilterData({
            cargo_id: '',
            permissao_id: '',
            scope_id: '',
            setor_id: '',
        });
        router.get('/admin/regras', {}, { preserveState: false });
    };

    /** ➕ Abre modal de criação */
    const openCreateModal = () => {
        reset();
        setEditingRegra(null);
        setShowModal(true);
    };

    /** ✏️ Abre modal de edição */
    const openEditModal = (regra: Regra) => {
        setEditingRegra(regra);
        setData({
            id: regra.id,
            cargo_id: regra.cargo_id,
            permissao_id: regra.permissao_id,
            scope_id: regra.scope_id,
            setor_id: regra.setor_id,
        });
        setShowModal(true);
    };

    /** ❌ Fecha modal */
    const closeModal = () => {
        setShowModal(false);
        reset();
        setEditingRegra(null);
    };

    /** 💾 Submit criação/edição */
    // 🧾 Função de envio separada e tipada
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            cargo_id: Number(data.cargo_id),
            permissao_id: Number(data.permissao_id),
            scope_id: data.scope_id ? Number(data.scope_id) : null,
            setor_id:
                data.setor_especifico && data.setor_id
                    ? Number(data.setor_id)
                    : null, // só envia se marcado e preenchido
        };

        const url = editingRegra
            ? '/admin/regras/atualizar'
            : '/admin/regras/criar';

        router.post(url, payload, {
            headers: { Accept: 'application/json' },
            preserveScroll: true,
            onSuccess: () => {
                if (Object.keys(errors).length === 0) closeModal(); // fecha só se não houver erro
            },
        });
    };

    /** 🗑 Exclui regra */
    const deleteRegra = (id: number) => {
        if (confirm('Deseja realmente excluir esta regra?')) {
            router.delete('/admin/regras/excluir', {
                data: { id },
                preserveScroll: true,
            });
        }
    };

    /** 📍 Verifica se o escopo selecionado exige setor */
    const scopeNeedsSetor = useCallback(() => {
        const selectedScope = scopes.find((s) => s.id === data.scope_id);
        const nome = selectedScope?.nome?.toLowerCase() || '';
        return nome.includes('setor') || nome.includes('sector');
    }, [scopes, data.scope_id]);
    // 🔄 Garante que o setor é limpo automaticamente quando o escopo não exige

    useEffect(() => {
        if (!scopeNeedsSetor()) {
            setData('setor_id', null);
        }
    }, [data.scope_id, scopeNeedsSetor, setData]);

    /** 📊 Agrupa regras por cargo */
    const regrasPorCargo = regras.reduce(
        (acc, regra) => {
            const cargoNome = regra.cargo?.nome || 'Sem cargo';
            if (!acc[cargoNome]) acc[cargoNome] = [];
            acc[cargoNome].push(regra);
            return acc;
        },
        {} as Record<string, Regra[]>,
    );

    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
            <Head title="Regras de Permissão" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-(--text-strong)">
                                Regras de Permissão
                            </h1>
                            <p className="mt-1 text-sm text-(--text-muted)">
                                Vincule permissões aos cargos com escopos
                                específicos
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-(--brand-700) px-4 py-2 text-white transition hover:bg-(--brand-600)"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Nova regra
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mb-6 rounded-lg border border-(--accent-info-border) bg-(--accent-info-soft) p-4">
                        <div className="flex">
                            <svg
                                className="mt-0.5 mr-3 h-5 w-5 text-(--accent-info)"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <p className="text-sm text-(--accent-info)">
                                    <strong>Como funciona:</strong> As regras
                                    definem QUAIS permissões cada CARGO possui e
                                    em QUAL ESCOPO.
                                </p>
                                <ul className="mt-2 ml-4 list-disc space-y-1 text-xs text-(--accent-info)">
                                    <li>
                                        <strong>Own (Próprio):</strong> Acesso
                                        apenas aos próprios dados
                                    </li>
                                    <li>
                                        <strong>Sector (Setor):</strong> Acesso
                                        aos dados do setor (requer seleção de
                                        setor)
                                    </li>
                                    <li>
                                        <strong>All (Todos):</strong> Acesso a
                                        todos os dados do sistema
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="mb-6 rounded-lg bg-(--surface-card) p-4 shadow-sm">
                        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                            {/* Cargo */}
                            <div className="flex flex-col">
                                <label className="mb-1 block text-sm font-medium text-(--text-strong)">
                                    Cargo
                                </label>
                                <select
                                    value={filterData.cargo_id}
                                    onChange={(e) =>
                                        setFilterData(
                                            'cargo_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-(--gpdl-border) bg-(--surface-card) px-4 py-2 text-(--text-strong) transition-colors duration-150"
                                >
                                    <option value="">Todos os cargos</option>
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Permissão */}
                            <div className="flex flex-col">
                                <label className="mb-1 block text-sm font-medium text-(--text-strong)">
                                    Permissão
                                </label>
                                <select
                                    value={filterData.permissao_id}
                                    onChange={(e) =>
                                        setFilterData(
                                            'permissao_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-(--gpdl-border) bg-(--surface-card) px-4 py-2 text-(--text-strong) transition-colors duration-150"
                                >
                                    <option value="">
                                        Todas as permissões
                                    </option>
                                    {permissoes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Escopo */}
                            <div className="flex flex-col">
                                <label className="mb-1 block text-sm font-medium text-(--text-strong)">
                                    Escopo
                                </label>
                                <select
                                    value={filterData.scope_id}
                                    onChange={(e) =>
                                        setFilterData(
                                            'scope_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-(--gpdl-border) bg-(--surface-card) px-4 py-2 text-(--text-strong) transition-colors duration-150"
                                >
                                    <option value="">Todos os escopos</option>
                                    {scopes.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Setor */}
                            <div className="flex flex-col">
                                <label className="mb-1 block text-sm font-medium text-(--text-strong)">
                                    Setor
                                </label>
                                <select
                                    value={filterData.setor_id}
                                    onChange={(e) =>
                                        setFilterData(
                                            'setor_id',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-(--gpdl-border) bg-(--surface-card) px-4 py-2 text-(--text-strong) transition-colors duration-150"
                                >
                                    <option value="">Todos os setores</option>
                                    {setores.map((setor) => (
                                        <option key={setor.id} value={setor.id}>
                                            {setor.nome}{' '}
                                            {setor.sigla
                                                ? `(${setor.sigla})`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={applyFilters}
                                className="rounded-lg bg-(--brand-700) px-4 py-2 text-sm text-white transition hover:bg-(--brand-600)"
                            >
                                Filtrar
                            </button>

                            <button
                                onClick={clearFilters}
                                className="rounded-lg bg-(--surface-muted) px-4 py-2 text-sm text-(--text-strong) transition hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    {/* Listagem agrupada por cargo */}
                    <div className="space-y-6">
                        {Object.keys(regrasPorCargo).length === 0 ? (
                            <div className="rounded-lg bg-(--surface-card) p-12 text-center shadow-sm">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4"
                                    />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-(--text-strong)">
                                    Nenhuma regra cadastrada
                                </h3>
                                <p className="mt-1 text-sm text-(--text-muted)">
                                    Comece criando uma nova regra de permissão.
                                </p>
                            </div>
                        ) : (
                            Object.entries(regrasPorCargo).map(
                                ([cargoNome, regrasGrupo]) => (
                                    <div
                                        key={cargoNome}
                                        className="overflow-hidden rounded-lg bg-(--surface-card) shadow-sm"
                                    >
                                        <div className="border-b border-(--gpdl-border) bg-(--surface-muted) px-6 py-4">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold text-(--text-strong)">
                                                {cargoNome}
                                                <span className="ml-2 rounded-full bg-(--accent-info-soft) px-2 py-1 text-xs font-medium text-(--accent-info)">
                                                    {regrasGrupo.length}{' '}
                                                    {regrasGrupo.length === 1
                                                        ? 'regra'
                                                        : 'regras'}
                                                </span>
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-(--gpdl-border)">
                                            {regrasGrupo.map((regra) => (
                                                <div
                                                    key={regra.id}
                                                    className="p-6 transition hover:bg-(--surface-muted)"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                                                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                    {regra
                                                                        .permissao
                                                                        ?.nome ||
                                                                        'N/A'}
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${regra
                                                                        .scope
                                                                        ?.nome ===
                                                                        'own'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : regra.scope?.nome
                                                                            ?.toLowerCase()
                                                                            .includes(
                                                                                'sector',
                                                                            ) ||
                                                                            regra.scope?.nome
                                                                                ?.toLowerCase()
                                                                                .includes(
                                                                                    'setor',
                                                                                )
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                                        }`}
                                                                >
                                                                    Scope:{' '}
                                                                    {regra.scope
                                                                        ?.nome ||
                                                                        'N/A'}
                                                                </span>
                                                                {regra.setor && (
                                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                                        Setor:{' '}
                                                                        {
                                                                            regra
                                                                                .setor
                                                                                .nome
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {regra.permissao
                                                                ?.descricao && (
                                                                    <p className="mt-2 text-sm text-(--text-muted)">
                                                                        {
                                                                            regra
                                                                                .permissao
                                                                                .descricao
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                        <div className="ml-4 flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        regra,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-(--gpdl-border) hover:bg-(--surface-muted) text-(--text-strong) transition"
                                                                title="Editar"
                                                            >
                                                                <svg
                                                                    className="h-5 w-5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Editar</span>
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    deleteRegra(
                                                                        regra.id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-300/60 text-(--danger-500) hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                                title="Excluir"
                                                            >
                                                                <svg
                                                                    className="h-5 w-5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Excluir</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={closeModal} />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-md rounded-2xl shadow-xl border border-(--gpdl-border) bg-(--surface-card) animate-scaleIn"
                    >
                        <div className="flex items-center justify-between border-b border-(--gpdl-border) p-6">
                            <h3 className="text-xl font-semibold text-(--text-strong)">
                                {editingRegra ? 'Editar Regra' : 'Nova Regra'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submit}>
                            <div className="space-y-4 p-6">
                                {/* CARGO */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-(--text-strong)">
                                        Cargo *
                                    </label>
                                    <select
                                        value={data.cargo_id || ''}
                                        onChange={(e) =>
                                            setData(
                                                'cargo_id',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full border border-(--gpdl-border) bg-(--surface-main) px-4 py-2 text-(--text-strong)"
                                        required
                                    >
                                        <option value="">
                                            Selecione um cargo
                                        </option>
                                        {cargos.map((cargo) => (
                                            <option
                                                key={cargo.id}
                                                value={cargo.id}
                                            >
                                                {cargo.nome}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cargo_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.cargo_id}
                                        </p>
                                    )}
                                </div>

                                {/* PERMISSÃO */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-(--text-strong)">
                                        Permissão *
                                    </label>
                                    <select
                                        value={data.permissao_id || ''}
                                        onChange={(e) =>
                                            setData(
                                                'permissao_id',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full border border-(--gpdl-border) bg-(--surface-main) px-4 py-2 text-(--text-strong)"
                                        required
                                    >
                                        <option value="">
                                            Selecione uma permissão
                                        </option>
                                        {permissoes.map((perm) => (
                                            <option
                                                key={perm.id}
                                                value={perm.id}
                                            >
                                                {perm.nome
                                                    ? `${perm.nome  }`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.permissao_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.permissao_id}
                                        </p>
                                    )}
                                </div>

                                {/* ESCOPO */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-(--text-strong)">
                                        Escopo (Scope) *
                                    </label>
                                    <select
                                        value={data.scope_id || ''}
                                        onChange={(e) =>
                                            setData(
                                                'scope_id',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full border border-(--gpdl-border) bg-(--surface-main) px-4 py-2 text-(--text-strong)"
                                        required
                                    >
                                        <option value="">
                                            Selecione um escopo
                                        </option>
                                        {scopes.map((scope) => (
                                            <option
                                                key={scope.id}
                                                value={scope.id}
                                            >
                                                {scope.nome}{' '}
                                                {scope.descricao
                                                    ? `- ${scope.descricao}`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.scope_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.scope_id}
                                        </p>
                                    )}
                                </div>

                                {/* 🔘 CHECKBOX — Ativar Setor Específico */}
                                <div className="mt-4 flex items-center gap-2">
                                    <input
                                        id="checkbox-setor"
                                        type="checkbox"
                                        checked={data.setor_especifico || false}
                                        onChange={(e) => {
                                            const checked = e.target.checked;

                                            if (checked) {
                                                // Ativa modo setorial
                                                setData(
                                                    'setor_especifico',
                                                    true,
                                                );
                                            } else {
                                                // Desativa e limpa o setor
                                                setData(
                                                    'setor_especifico',
                                                    false,
                                                );
                                                setData('setor_id', null);
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-(--brand-700) focus:ring-(--brand-600)"
                                    />
                                    <label
                                        htmlFor="checkbox-setor"
                                        className="text-sm font-medium text-(--text-strong) select-none"
                                    >
                                        Aplicar a um setor específico
                                    </label>
                                </div>

                                {/* SETOR — aparece só se o checkbox estiver ativo */}
                                {data.setor_especifico && (
                                    <div className="mt-2">
                                        <label className="mb-2 block text-sm font-medium text-(--text-strong)">
                                            Setor {scopeNeedsSetor() && '*'}
                                        </label>
                                        <select
                                            value={data.setor_id || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'setor_id',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                            className="w-full border border-(--gpdl-border) bg-(--surface-main) px-4 py-2 text-(--text-strong)"
                                            required={scopeNeedsSetor()}
                                        >
                                            <option value="">
                                                Selecione um setor
                                            </option>
                                            {setores.map((setor) => (
                                                <option
                                                    key={setor.id}
                                                    value={setor.id}
                                                >
                                                    {setor.sigla
                                                        ? `(${setor.sigla})`
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.setor_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.setor_id}
                                            </p>
                                        )}
                                        {scopeNeedsSetor() && (
                                            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                ⚠️ Scope "sector" requer seleção
                                                de setor
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* BOTÕES */}
                            <div className="flex items-center justify-end gap-3 border-t border-(--gpdl-border) p-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-(--brand-700) px-4 py-2 text-white hover:bg-(--brand-600) disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* animações mínimas (Tailwind inline) */}
            <style>{`
        .animate-fadeIn { animation: fadeIn .2s ease-out; }
        .animate-scaleIn { animation: scaleIn .18s ease-out; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
        </GPDLLayout>
    );
}
