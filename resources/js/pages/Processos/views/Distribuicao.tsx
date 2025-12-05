import React from 'react';
import { Paginator, TablePlaceholder } from '../components/ListHelpers';
import type { ProcessoRow } from '../components/ListHelpers';

export default function DistribuicaoView({ processos }: { processos?: Paginator<ProcessoRow> | undefined }) {
  return (
    <div className="mt-4 rounded-lg bg-[var(--surface-card)] p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-strong)]">Distribuicao</h2>
      <TablePlaceholder />
    </div>
  );
}
