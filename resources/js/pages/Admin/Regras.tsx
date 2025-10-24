import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';

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
    };
}

export default function Regras({ regras, cargos, permissoes, scopes, setores, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingRegra, setEditingRegra] = useState<Regra | null>(null);

    const { data: filterData, setData: setFilterData, get } = useForm({
        cargo_id: filters.cargo_id || '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        id: 0,
        cargo_id: '',
        permissao_id: '',
        scope_id: '',
        setor_id: '',
    });

    const applyFilters = () => {
        get('/admin/regras', {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setFilterData({ cargo_id: '' });
        router.get('/admin/regras');
    };

    const openCreateModal = () => {
        reset();
        setEditingRegra(null);
        setShowModal(true);
    };

    const openEditModal = (regra: Regra) => {
        setEditingRegra(regra);
        setData({
            id: regra.id,
            cargo_id: regra.cargo_id.toString(),
            permissao_id: regra.permissao_id.toString(),
            scope_id: regra.scope_id?.toString() || '',
            setor_id: regra.setor_id?.toString() || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
        setEditingRegra(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingRegra) {
            post('/admin/regras/atualizar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/regras/criar', {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteRegra = (id: number) => {
        if (confirm('Deseja realmente excluir esta regra?')) {
            router.delete('/admin/regras/excluir', {
                data: { id },
                preserveScroll: true,
            });
        }
    };

    // Verifica se o scope selecionado precisa de setor
    const scopeNeedsSetor = () => {
        const selectedScope = scopes.find(s => s.id.toString() === data.scope_id);
        return selectedScope?.nome.toLowerCase().includes('setor') || selectedScope?.nome.toLowerCase().includes('sector');
    };

    // Agrupa regras por cargo para melhor visualização
    const regrasPorCargo = regras.reduce((acc, regra) => {
        const cargoNome = regra.cargo?.nome || 'Sem cargo';
        if (!acc[cargoNome]) {
            acc[cargoNome] = [];
        }
        acc[cargoNome].push(regra);
        return acc;
    }, {} as Record<string, Regra[]>);

    return (
        <AuthLayout>
            <Head title="Regras de Permissão" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Regras de Permissão
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Vincule permissões aos cargos com escopos específicos
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nova regra
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Como funciona:</strong> As regras definem QUAIS permissões cada CARGO possui e em QUAL ESCOPO.
                                </p>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 ml-4 list-disc">
                                    <li><strong>Own (Próprio):</strong> Usuário acessa apenas seus próprios dados</li>
                                    <li><strong>Sector (Setor):</strong> Usuário acessa dados do seu setor (precisa escolher o setor)</li>
                                    <li><strong>All (Todos):</strong> Usuário acessa todos os dados do sistema</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Filtro */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Filtrar por Cargo
                                </label>
                                <select
                                    value={filterData.cargo_id}
                                    onChange={(e) => setFilterData('cargo_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="">Todos os cargos</option>
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                Filtrar
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition text-sm"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    {/* Listagem Agrupada por Cargo */}
                    <div className="space-y-6">
                        {Object.keys(regrasPorCargo).length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                                    Nenhuma regra cadastrada
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Comece criando uma nova regra de permissão.
                                </p>
                            </div>
                        ) : (
                            Object.entries(regrasPorCargo).map(([cargoNome, regrasGrupo]) => (
                                <div key={cargoNome} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {cargoNome}
                                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                                {regrasGrupo.length} {regrasGrupo.length === 1 ? 'regra' : 'regras'}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="divide-y dark:divide-gray-700">
                                        {regrasGrupo.map((regra) => (
                                            <div key={regra.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <code className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded font-mono text-sm font-semibold">
                                                                {regra.permissao?.nome || 'N/A'}
                                                            </code>
                                                            <span className="text-gray-600 dark:text-gray-400">→</span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                regra.scope?.nome === 'own' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                regra.scope?.nome === 'sector' || regra.scope?.nome === 'setor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                            }`}>
                                                                Scope: {regra.scope?.nome || 'N/A'}
                                                            </span>
                                                            {regra.setor && (
                                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold">
                                                                    Setor: {regra.setor.nome}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {regra.permissao?.descricao && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                {regra.permissao.descricao}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => openEditModal(regra)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteRegra(regra.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                                            title="Excluir"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {editingRegra ? 'Editar Regra' : 'Nova Regra'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submit}>
                            <div className="p-6 space-y-4">
                                {/* Cargo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cargo *
                                    </label>
                                    <select
                                        value={data.cargo_id}
                                        onChange={(e) => setData('cargo_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Selecione um cargo</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                                        ))}
                                    </select>
                                    {errors.cargo_id && <p className="mt-1 text-sm text-red-600">{errors.cargo_id}</p>}
                                </div>

                                {/* Permissão */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Permissão *
                                    </label>
                                    <select
                                        value={data.permissao_id}
                                        onChange={(e) => setData('permissao_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Selecione uma permissão</option>
                                        {permissoes.map((perm) => (
                                            <option key={perm.id} value={perm.id}>
                                                {perm.nome} {perm.descricao ? `- ${perm.descricao}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.permissao_id && <p className="mt-1 text-sm text-red-600">{errors.permissao_id}</p>}
                                </div>

                                {/* Scope */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Escopo (Scope) *
                                    </label>
                                    <select
                                        value={data.scope_id}
                                        onChange={(e) => setData('scope_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Selecione um escopo</option>
                                        {scopes.map((scope) => (
                                            <option key={scope.id} value={scope.id}>
                                                {scope.nome} {scope.descricao ? `- ${scope.descricao}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.scope_id && <p className="mt-1 text-sm text-red-600">{errors.scope_id}</p>}
                                </div>

                                {/* Setor (condicional) */}
                                {scopeNeedsSetor() && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Setor *
                                        </label>
                                        <select
                                            value={data.setor_id}
                                            onChange={(e) => setData('setor_id', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        >
                                            <option value="">Selecione um setor</option>
                                            {setores.map((setor) => (
                                                <option key={setor.id} value={setor.id}>
                                                    {setor.nome} {setor.sigla ? `(${setor.sigla})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.setor_id && <p className="mt-1 text-sm text-red-600">{errors.setor_id}</p>}
                                        <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                            ⚠️ Scope "sector" requer a seleção de um setor específico
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}