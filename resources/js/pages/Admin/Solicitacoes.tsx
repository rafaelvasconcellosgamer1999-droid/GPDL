import GPDLLayout from '@/layouts/gpdl-layout';
import { type BreadcrumbItem } from '@/types';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';

// --- DEFINIÇÕES DE TIPOS (MANTIDAS) ---

interface Solicitacao {
    id: number;
    nome: string;
    usuarioRede: string;
    email: string;
    setor?: string;
    cargo_id?: number;
    data_solicitacao: string;
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

interface Props {
    solicitacoes: Solicitacao[];
    cargos: Cargo[];
    setores: Setor[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '/admin' }, { title: 'Solicitaes', href: '/admin/solicitacoes' }];
const generatePassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `Temp${randomNum}`;
};

export default function Solicitacoes({ solicitacoes, cargos, setores }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: 0,
        cargo_id: '',
        setor_id: '',
        senha: '',
    });

    const openApproveModal = (solicitacao: Solicitacao) => {
        setSelectedSolicitacao(solicitacao);
        reset();
        setData({
            id: solicitacao.id,
            cargo_id: solicitacao.cargo_id?.toString() || '',
            setor_id: '',
            senha: generatePassword(), 
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSolicitacao(null);
        reset();
    };


    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/admin/solicitacoes/aprovar', {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
        });
    };
    
    const rejectSolicitacao = (id: number, nome: string) => {
        if (confirm(`Deseja realmente rejeitar a solicitação de "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
            router.delete('/admin/solicitacoes/rejeitar', {
                data: { id },
                preserveScroll: true,
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    return (
        <GPDLLayout breadcrumbs={breadcrumbs}>
            <AdminTabs />
            <Head title="Solicitações" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-(--text-strong)">
                            Solicitações de Acesso
                        </h1>
                        <p className="text-sm text-(--text-muted) mt-1">
                            Acompanhe, aprove ou rejeite os novos pedidos de acesso enviados pelos usuários
                        </p>
                    </div>

                    {/* Conteúdo */}
                    <div className="bg-(--surface-card) overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {solicitacoes.length === 0 ? (
                                // Estado vazio
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-(--text-strong)">
                                        Nenhuma solicitação por aqui
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Assim que alguém solicitar acesso, o pedido aparecerá nesta lista.
                                    </p>
                                </div>
                            ) : (
                                // Lista de solicitações
                                <div className="space-y-4">
                                    {solicitacoes.map((solicitacao) => (
                                        <div
                                            key={solicitacao.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow hover:shadow-lg"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-(--text-strong)">
                                                                {solicitacao.nome}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Solicitado em {formatDate(solicitacao.data_solicitacao)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                Usuário de Rede
                                                            </p>
                                                            <p className="text-sm font-medium text-(--text-strong)">
                                                                {solicitacao.usuarioRede}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                E-mail
                                                            </p>
                                                            <p className="text-sm font-medium text-(--text-strong)">
                                                                {solicitacao.email}
                                                            </p>
                                                        </div>
                                                        {solicitacao.setor && (
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                    Setor Solicitado
                                                                </p>
                                                                <p className="text-sm font-medium text-(--text-strong)">
                                                                    {solicitacao.setor}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 ml-4">
                                                    <button
                                                        onClick={() => openApproveModal(solicitacao)}
                                                        className="px-4 py-2 bg-(--success-500) text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => rejectSolicitacao(solicitacao.id, solicitacao.nome)}
                                                        className="px-4 py-2 bg-(--danger-500) text-white rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Aprovação */}
            {showModal && selectedSolicitacao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={closeModal} />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-md rounded-2xl shadow-xl border border-(--gpdl-border) bg-(--surface-card) animate-scaleIn"
                    >
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-(--text-strong)">
                                Aprovar Solicitação
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={submit}>
                            <div className="p-6 space-y-4">
                                {/* Info do Usuário */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm font-medium text-(--text-strong)">
                                        {selectedSolicitacao.nome}
                                    </p>
                                    <p className="text-xs text-(--text-muted) mt-1">
                                        {selectedSolicitacao.usuarioRede} • {selectedSolicitacao.email}
                                    </p>
                                </div>

                                {/* Cargo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cargo *
                                    </label>
                                    <select
                                        value={data.cargo_id}
                                        onChange={(e) => setData('cargo_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-(--text-strong) focus:ring-2 focus:ring-(--brand-600) focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione um cargo</option>
                                        {cargos.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.nome}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cargo_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cargo_id}</p>
                                    )}
                                </div>

                                {/* Setor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Setor *
                                    </label>
                                    <select
                                        value={data.setor_id}
                                        onChange={(e) => setData('setor_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-(--text-strong) focus:ring-2 focus:ring-(--brand-600) focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione um setor</option>
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

                                {/* Info Senha */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                    <div className="flex">
                                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                Uma senha temporária será gerada automaticamente e exibida após a aprovação.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    className="px-4 py-2 bg-(--success-500) text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? 'Aprovando...' : 'Aprovar'}
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