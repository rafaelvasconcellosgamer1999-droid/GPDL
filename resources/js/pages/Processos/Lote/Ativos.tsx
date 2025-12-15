import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Paginator, ProcessoRow, FiltersForm, TableList, Toolbar, Pager, Procurador } from '../components/ListHelpers';

interface Props {
  processos: Paginator<ProcessoRow>;
  filters: FiltersForm;
  procuradores: Procurador[];
}

export default function Ativos({ processos, filters, procuradores }: Props) {
  const { data: f, setData: setF } = useForm<FiltersForm>({
    responsavel_id: filters?.responsavel_id || '',
    order: filters?.order || 'prazo_asc',
    per_page: filters?.per_page || '10',
  });

  const onApply = () => {
    router.get('/processos/ativos', f, { preserveState: true, preserveScroll: true });
  };

  const onClear = () => {
    setF({ responsavel_id: '', order: 'prazo_asc', per_page: '10' });
    router.get('/processos/ativos', {}, { preserveState: true });
  };

  const [finalizingId, setFinalizingId] = React.useState<number | null>(null);
  function finalizeOne(id: number) {
    setFinalizingId(id);
    router.post(`/processos/${id}/finalizar`, {}, {
      preserveScroll: true,
      onFinish: () => setFinalizingId(null),
    });
  }

  return (
    <GPDLLayout breadcrumbs={[{ title: 'Processos', href: '/processos/ativos' },{ title: 'Ativos', href: '/processos/ativos' }]}>
      <Head title="Processos - Ativos" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-(--text-strong)">Processos</h1>
        <p className="mt-1 text-sm text-(--text-muted)">Gerenciamento de ativos</p>
      </div>

      <div className="rounded-lg bg-(--surface-card) p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-(--text-strong)">Ativos</h2>
        <Toolbar filtros={f} setF={setF} onApply={onApply} onClear={onClear} procuradores={procuradores || []} />
        <TableList itens={processos?.data || []} empty="Nenhum processo ativo." showActions onFinalize={finalizeOne} finalizingId={finalizingId} />
        <Pager meta={processos} />
      </div>
    </GPDLLayout>
  );
}