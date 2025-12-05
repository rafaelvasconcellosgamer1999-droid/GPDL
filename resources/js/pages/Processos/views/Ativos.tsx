import React from 'react';
import { Paginator, Procurador, FiltersForm, TableList, Toolbar, Pager } from '../components/ListHelpers';
import type { ProcessoRow } from '../components/ListHelpers';

export default function AtivosView({
  processos,
  filtros,
  setF,
  onApply,
  onClear,
  procuradores,
  onFinalize,
  finalizingId,
}: {
  processos?: Paginator<ProcessoRow> | undefined;
  filtros: FiltersForm;
  setF: (k: keyof FiltersForm, v: string) => void;
  onApply: () => void;
  onClear: () => void;
  procuradores: Procurador[];
  onFinalize?: (id: number) => void;
  finalizingId?: number | null;
}) {
  return (
    <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">Ativos</h2>
      <Toolbar filtros={filtros} setF={setF} onApply={onApply} onClear={onClear} procuradores={procuradores} />
      <TableList itens={processos?.data || []} empty="Nenhum processo ativo." showActions onFinalize={onFinalize} finalizingId={finalizingId} />
      <Pager meta={processos} />
    </div>
  );
}
