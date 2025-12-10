import React, { useMemo, useState, FormEventHandler } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { AdminTabs } from '@/components/admin-tabs';
import { Head, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Tematica {
  id: number;
  nome: string;
  tipo?: string | null;
}

interface Props {
  tematicas: Tematica[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin', href: '/admin' },
  { title: 'Temáticas', href: '/admin/tematicas' },
];

export default function Tematicas({ tematicas }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tematica | null>(null);
  const [query, setQuery] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    id: 0,
    nome: '',
    tipo: '',
  });

  const openCreate = () => {
    reset();
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (t: Tematica) => {
    setEditing(t);
    setData({ id: t.id, nome: t.nome, tipo: t.tipo || '' });
    setShowModal(true);
  };

  const close = () => {
    setShowModal(false);
    reset();
    setEditing(null);
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(editing ? '/admin/tematicas/editar' : '/admin/tematicas/criar', {
      preserveScroll: true,
      onSuccess: () => close(),
    });
  };

  const remove = (id: number, nome?: string) => {
    if (confirm(`Deseja excluir a temática ${nome ? `\"${nome}\" ` : ''}? Esta ação não pode ser desfeita.`)) {
      router.post('/admin/tematicas/deletar', { id }, { preserveScroll: true });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tematicas
      .filter((t) => {
        if (!q) return true;
        return (
          t.nome.toLowerCase().includes(q) ||
          (t.tipo || '').toLowerCase().includes(q) ||
          String(t.id).includes(q)
        );
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [tematicas, query]);

  const counts = useMemo(() => ({ total: tematicas.length }), [tematicas]);

  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
      <AdminTabs />
      <Head title="Temáticas - GPDL" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-strong)]">Temáticas</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">Cadastre e gerencie temáticas.</p>
              </div>

              <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-700)] text-white shadow-sm hover:bg-[var(--brand-600)] active:scale-[0.99] transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Nova temática
              </button>
            </div>

            <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, tipo ou ID..." className="w-72 max-w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]" />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/></svg>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">Total: <b className="text-[var(--text-strong)]">{counts.total}</b></span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-card)] overflow-hidden shadow-sm sm:rounded-xl border border-[var(--gpdl-border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[var(--surface-muted)] sticky top-0 z-10">
                  <tr className="[&>th]:px-6 [&>th]:py-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:tracking-wider [&>th]:uppercase [&>th]:text-[var(--text-muted)]">
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gpdl-border)]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z"/></svg>
                          <p className="mt-2 text-[var(--text-muted)]">Nenhuma temática encontrada.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t.id} className={idx % 2 === 1 ? 'bg-[color:var(--surface-main)/0.35]' : undefined}>
                        <td className="px-6 py-3 whitespace-nowrap text-[var(--text-strong)]">{t.id}</td>
                        <td className="px-6 py-3 text-[var(--text-strong)]">{t.nome}</td>
                        <td className="px-6 py-3 text-[var(--text-strong)]">{t.tipo || <span className="text-[var(--text-muted)]">—</span>}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--gpdl-border)] hover:bg-[var(--surface-muted)] text-[var(--text-strong)] transition" title="Editar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              <span className="hidden sm:inline">Editar</span>
                            </button>

                            <button onClick={() => remove(t.id, t.nome)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--gpdl-border)] hover:bg-[var(--surface-muted)] text-[var(--text-strong)] transition" title="Excluir">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
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

            <div className="px-6 py-4 border-t border-[var(--gpdl-border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Mostrando {filtered.length} de {counts.total}</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={close} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl shadow-xl border border-[var(--gpdl-border)] bg-[var(--surface-card)] animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-[var(--text-strong)]">{editing ? 'Editar temática' : 'Nova temática'}</h3>
              <button onClick={close} className="p-2 rounded-lg hover:bg-[var(--surface-muted)] text-[var(--text-muted)]" title="Fechar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">Nome <span className="text-[var(--danger-500)]">*</span></label>
                  <input type="text" value={data.nome} onChange={(e) => setData('nome', e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]" placeholder="Ex: Meio Ambiente" autoFocus />
                  {errors.nome && <p className="mt-1 text-xs text-[var(--danger-500)]">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">Tipo</label>
                  <input type="text" value={data.tipo} onChange={(e) => setData('tipo', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-[var(--gpdl-border)] bg-[var(--surface-card)] text-[var(--text-strong)] outline-none focus:ring-2 focus:ring-[var(--brand-600)]" placeholder="Ex: Tema/Assunto" maxLength={100} />
                  {errors.tipo && <p className="mt-1 text-xs text-[var(--danger-500)]">{errors.tipo}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
                <button type="button" onClick={close} className="px-4 py-2 rounded-lg bg-[var(--surface-muted)] text-[var(--text-strong)] hover:opacity-90 transition" disabled={processing}>Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--brand-700)] text-white hover:bg-[var(--brand-600)] disabled:opacity-50 transition" disabled={processing}>{processing ? 'Salvando…' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{` .animate-fadeIn { animation: fadeIn .2s ease-out; } .animate-scaleIn { animation: scaleIn .18s ease-out; } @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes scaleIn { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } } `}</style>
    </GPDLLayout>
  );
}
