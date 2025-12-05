import React from 'react';
import { Paginator, Procurador, FiltersForm, TableList, Toolbar, Pager } from '../components/ListHelpers';
import type { ProcessoRow } from '../components/ListHelpers';

export default function EncerradosView({
  processos,
  filtros,
  setF,
  onApply,
  onClear,
  procuradores,
}: {
  processos?: Paginator<ProcessoRow> | undefined;
  filtros: FiltersForm;
  setF: (k: keyof FiltersForm, v: string) => void;
  onApply: () => void;
  onClear: () => void;
  procuradores: Procurador[];
}) {
  return (
    <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">Finalizados</h2>
      <Toolbar filtros={filtros} setF={setF} onApply={onApply} onClear={onClear} procuradores={procuradores} />
      <TableList itens={processos?.data || []} empty="Nenhum processo finalizado." />
      <Pager meta={processos} />
    </div>
  );
}
