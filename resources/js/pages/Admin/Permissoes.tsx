import GPDLLayout from '@/layouts/gpdl-layout';
import { type BreadcrumbItem } from '@/types';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, FormEventHandler } from 'react';

interface Permissao {
  id: number;
  chave: string;     // slug (código) técnico, por exemplo: "processos.editar"
  nome: string;      // nome legível (Ex: "Editar Processos")
  descricao: string;
}

interface Props {
  permissoes: Permissao[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin' },
  { title: 'Permissões', href: '/admin/permissoes' },
];

export default function Permissoes({ permissoes }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState<Permissao | null>(null);
  const [query, setQuery] = useState('');

  // 🔁 Agora trabalhamos com chave, nome e descricao
  const { data, setData, post, processing, errors, reset } = useForm({
    id: 0,
    chave: '',     // código (slug)
    nome: '',      // nome legível (opcional)
    descricao: '',
  });

  // Abrir modal para criar nova permissão
  const openCreateModal = () => {
    reset();
    setEditingPermissao(null);
    setShowModal(true);
  };

  // Abrir modal para editar permissão existente
  const openEditModal = (permissao: Permissao) => {
    setEditingPermissao(permissao);
    setData({
      id: permissao.id,
      chave: permissao.chave,
      nome: permissao.nome || '',
      descricao: permissao.descricao || '',
    });
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    reset();
    setEditingPermissao(null);
  };

  // Enviar formulário
  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(editingPermissao ? 'permissoes/editar' : 'permissoes/criar', {
      preserveScroll: true,
      onSuccess: () => closeModal(),
    });
  };

  // Excluir permissão
  const deletePermissao = (id: number, chave: string) => {
    if (confirm(`Deseja realmente excluir a permissão "${chave}"?`)) {
      router.delete(`/admin/permissoes/${id}`, { preserveScroll: true });
    }
  };

  // 🔍 Filtro local (filtra por chave, nome ou descrição)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return permissoes
      .filter(
        (p) =>
          !q ||
          p.chave.toLowerCase().includes(q) ||
          p.nome?.toLowerCase().includes(q) ||
          p.descricao?.toLowerCase().includes(q),
      )
      .sort((a, b) => a.chave.localeCompare(b.chave));
  }, [permissoes, query]);

  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
      <AdminTabs />
      <Head title="Permissões - GPDL" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-(--text-strong)">Permissões</h1>
                <p className="text-sm text-(--text-muted) mt-1">
                  Crie, edite e remova permissões do sistema.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--brand-700) text-white shadow-sm hover:bg-(--brand-600) active:scale-[0.99] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova permissão
              </button>
            </div>

            {/* Barra de busca */}
            <div className="mt-4 mb-6 flex items-center gap-2">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por chave, nome ou descrição..."
                  className="w-80 pl-9 pr-3 py-2 rounded-lg border border-(--gpdl-border) bg-(--surface-card) text-(--text-strong) outline-none focus:ring-2 focus:ring-(--brand-600)"
                />
                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="mt-6 bg-(--surface-card) overflow-hidden shadow-sm sm:rounded-xl border border-(--gpdl-border)">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-(--surface-muted) sticky top-0 z-10">
                  <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-wider [&>th]:uppercase [&>th]:text-(--text-muted)">
                    <th>ID</th>
                    <th>Código (slug)</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--gpdl-border)">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <svg className="w-10 h-10 text-(--text-muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="mt-2 text-(--text-muted)">
                            Nenhuma permissão encontrada.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((permissao, idx) => (
                      <tr
                        key={permissao.id}
                        className={idx % 2 === 1 ? 'bg-[var(--surface-main)/0.35]' : undefined}
                      >
                        <td className="px-6 py-3 text-(--text-strong)">{permissao.id}</td>
                        <td className="px-6 py-3 font-mono text-(--accent-info)">{permissao.chave}</td>
                        <td className="px-6 py-3 text-(--text-strong)">{permissao.nome}</td>
                        <td className="px-6 py-3 text-(--text-strong)">
                          {permissao.descricao || <span className="text-(--text-muted)">—</span>}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(permissao)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-(--gpdl-border) hover:bg-(--surface-muted) text-(--text-strong) transition"
                              title="Editar permissão"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              onClick={() => deletePermissao(permissao.id, permissao.chave)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-300/60 text-(--danger-500) hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Excluir permissão"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="hidden sm:inline">Excluir</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Rodapé */}
            <div className="px-6 py-4 border-t border-(--gpdl-border) flex items-center justify-between text-xs text-(--text-muted)">
              <span>Mostrando {filtered.length} de {permissoes.length}</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={closeModal} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl shadow-xl border border-(--gpdl-border) bg-(--surface-card) animate-scaleIn"
          >
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-(--text-strong)">
                {editingPermissao ? 'Editar permissão' : 'Nova permissão'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-(--surface-muted) text-(--text-muted)"
                title="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="p-6 space-y-4">
                {/* Campo de chave (slug) */}
                <div>
                  <label className="block text-sm font-medium text-(--text-strong) mb-1">
                    Código (slug) <span className="text-(--danger-500)">*</span>
                  </label>
                    <input
                      type="text"
                      value={data.chave}
                      onChange={(e) => setData('chave', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      className="w-full px-4 py-2 rounded-lg border border-(--gpdl-border) bg-(--surface-card) text-(--text-strong) outline-none focus:ring-2 focus:ring-(--brand-600) font-mono"
                      placeholder="Ex: view_dashboard"
                      required
                      autoFocus
                    />
                    {errors.chave && (
                      <p className="mt-1 text-xs text-(--danger-500)">{errors.chave}</p>
                    )}
                </div>
                {/* Campo opcional de nome (legível) */}
                <div>
                  <label className="block text-sm font-medium text-(--text-strong) mb-1">
                    Nome legível
                  </label>
                  <input
                    type="text"
                    value={data.nome}
                    onChange={(e) => setData('nome', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-(--gpdl-border) bg-(--surface-card) text-(--text-strong) outline-none focus:ring-2 focus:ring-(--brand-600)"
                    placeholder="Ex: Visualizar Dashboard"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-xs text-(--danger-500)">{errors.nome}</p>
                  )}
                </div>

                {/* Campo de descrição */}
                <div>
                  <label className="block text-sm font-medium text-(--text-strong) mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={data.descricao}
                    onChange={(e) => setData('descricao', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-(--gpdl-border) bg-(--surface-card) text-(--text-strong) outline-none focus:ring-2 focus:ring-(--brand-600)"
                    placeholder="Ex: Permite visualizar o dashboard"
                  />
                  {errors.descricao && (
                    <p className="mt-1 text-xs text-(--danger-500)">{errors.descricao}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-(--surface-muted) text-(--text-strong) hover:opacity-90 transition"
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-(--brand-700) text-white hover:bg-(--brand-600) disabled:opacity-50 transition"
                  disabled={processing}
                >
                  {processing ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* animações */}
      <style>{`
        .animate-fadeIn { animation: fadeIn .2s ease-out; }
        .animate-scaleIn { animation: scaleIn .18s ease-out; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </GPDLLayout>
  );
}
