import GPDLLayout from '@/layouts/gpdl-layout';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useMemo, useState, FormEventHandler } from 'react';

interface Setor {
  id: number;
  nome: string;
  usuarios_count?: number;
  sigla: string;
  status: boolean;
}

interface Props {
  setores: Setor[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin' },
  { title: 'Setores', href: '/admin/setores' },
];

type StatusFilter = 'all' | 'active' | 'inactive';

export default function Setores({ setores }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, setData, post, processing, errors, reset } = useForm({
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
    // mantém seus endpoints:
    post(editingSetor ? '/admin/setores/editar' : '/admin/setores/criar', {
      preserveScroll: true,
      onSuccess: () => closeModal(),
    });
  };

  const toggleStatus = (id: number) => {
    if (confirm('Deseja alterar o status deste setor?')) {
      router.post('/admin/setores/toggle', { id }, { preserveScroll: true });
    }
  };

  // ---- Filtro/Busca client-side (não quebra nada do backend) ----
  const counts = useMemo(() => {
    const active = setores.filter((s) => s.status).length;
    return { total: setores.length, active, inactive: setores.length - active };
  }, [setores]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return setores
      .filter((s) => {
        if (statusFilter === 'active' && !s.status) return false;
        if (statusFilter === 'inactive' && s.status) return false;
        if (!q) return true;
        return (
          s.nome.toLowerCase().includes(q) ||
          (s.sigla || '').toLowerCase().includes(q) ||
          String(s.id).includes(q)
        );
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [setores, query, statusFilter]);

  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
      <AdminTabs />
      <Head title="Setores - GPDL" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-strong)]">Setores</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Crie, edite e (des)ative setores organizacionais.
                </p>
              </div>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-700)] text-white shadow-sm hover:bg-[var(--brand-600)] active:scale-[0.99] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo setor
              </button>
            </div>

            {/* Toolbar de busca/filtro/contadores */}
            <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nome, sigla ou ID..."
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
          </div>

          {/* Tabela */}
          <div className="bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-xl border border-[var(--gpdl-border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[var(--surface-muted)] sticky top-0 z-10">
                  <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-wider [&>th]:uppercase [&>th]:text-[var(--text-muted)]">
                    <th>ID</th>
                    <th>Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuários</th>
                    <th>Sigla</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gpdl-border)]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2 text-[var(--text-muted)]">
                            Nenhum setor encontrado com o filtro atual.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((setor, idx) => (
                      <tr
                        key={setor.id}
                        className={idx % 2 === 1 ? 'bg-[color:var(--surface-main)/0.35]' : undefined}
                      >
                        <td className="px-6 py-3 whitespace-nowrap text-[var(--text-strong)]">{setor.id}</td>
                        <td className="px-6 py-3 text-[var(--text-strong)]">{setor.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {setor.usuarios_count || 0} {setor.usuarios_count === 1 ? 'usuário' : 'usuários'}
                            </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-[var(--text-strong)]">
                          {setor.sigla || <span className="text-[var(--text-muted)]">—</span>}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span
                            className={[
                              'px-2.5 py-1 inline-flex text-xs font-semibold rounded-full',
                              setor.status
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
                            ].join(' ')}
                          >
                            {setor.status ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(setor)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--gpdl-border)] hover:bg-[var(--surface-muted)] text-[var(--text-strong)] transition"
                              title="Editar setor"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="hidden sm:inline">Editar</span>
                            </button>

                            <button
                              onClick={() => toggleStatus(setor.id)}
                              className={[
                                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition',
                                setor.status
                                  ? 'border border-red-300/60 text-[var(--danger-500)] hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'border border-green-300/60 text-[var(--success-500)] hover:bg-green-50 dark:hover:bg-green-900/20',
                              ].join(' ')}
                              title={setor.status ? 'Desativar' : 'Ativar'}
                            >
                              {setor.status ? (
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
                          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={closeModal} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl shadow-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] animate-scaleIn"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                {editingSetor ? 'Editar setor' : 'Novo setor'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--text-muted)]"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={submit}>
              <div className="p-6 space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                    Nome do setor <span className="text-[var(--danger-500)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.nome}
                    onChange={(e) => setData('nome', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                    placeholder="Ex: Diretoria de Tecnologia"
                    required
                    autoFocus
                  />
                  {errors.nome && (
                    <p className="mt-1 text-xs text-[var(--danger-500)]">{errors.nome}</p>
                  )}
                </div>

                {/* Sigla */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                    Sigla
                  </label>
                  <input
                    type="text"
                    value={data.sigla}
                    onChange={(e) => setData('sigla', e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                    placeholder="Ex: DTI"
                    maxLength={20}
                  />
                  {errors.sigla && (
                    <p className="mt-1 text-xs text-[var(--danger-500)]">{errors.sigla}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
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
