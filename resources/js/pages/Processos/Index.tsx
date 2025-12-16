// resources/js/Pages/Processos/Index.tsx
import React, { useEffect, useState } from 'react';
import GPDLLayout from '@/layouts/gpdl-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Head, router, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import CadastroView from './Individual/CadastroIndividual';

export type Procurador = { id: number; nome: string };
export type OptionItem = { id: string | number; nome: string };

interface PageProps extends Record<string, unknown> {
  flash?: { success?: string; error?: string };
  procuradores?: Procurador[];
  setorSelecionado?: string;
  setores?: { id: string; nome: string }[];
  tribunais?: OptionItem[];
  acoes?: OptionItem[];
  orgaos?: OptionItem[];
  orgaosJulgadores?: OptionItem[];
}

export default function ProcessosIndex({ procuradores = [] as Procurador[] }: { procuradores?: Procurador[] }) {
  const page = usePage<PageProps>();
  const flashSuccess = page.props?.flash?.success;
  const flashError = page.props?.flash?.error;

  const setoresFromBackend = page.props?.setores;
  const DEFAULT_SETORS = [
    { id: 'civel', nome: 'Cível' },
    { id: 'trabalhista', nome: 'Trabalhista' },
  ];
  const setores = setoresFromBackend && setoresFromBackend.length > 0 ? setoresFromBackend : DEFAULT_SETORS;

  const initialSetor =
    (page.props?.setorSelecionado as string | undefined) ??
    (typeof window !== 'undefined' ? localStorage.getItem('setorSelecionado') ?? '' : '');

  const [setorSelecionado, setSetorSelecionado] = useState<string>(initialSetor);
  const [flashSuccessLocal, setFlashSuccessLocal] = useState<string>('');
  const [flashErrorLocal, setFlashErrorLocal] = useState<string>('');

  useEffect(() => {
    if (!flashSuccess) return;
    setFlashSuccessLocal(flashSuccess);
    const id = setTimeout(() => setFlashSuccessLocal(''), 5000);
    return () => clearTimeout(id);
  }, [flashSuccess]);

  useEffect(() => {
    if (!flashError) return;
    setFlashErrorLocal(flashError);
    const id = setTimeout(() => setFlashErrorLocal(''), 6000);
    return () => clearTimeout(id);
  }, [flashError]);

  async function persistSetor(setorId: string) {
    setSetorSelecionado(setorId);
    if (typeof window !== 'undefined') localStorage.setItem('setorSelecionado', setorId);
    try {
      await router.post('/processos/set-setor', { setor: setorId }, { preserveState: true });
    } catch (err) {
      console.error('Erro ao persistir setor:', err);
    }
  }

  const breadcrumb = [{ title: 'Processos', href: '/processos' }];

  return (
    <GPDLLayout breadcrumbs={breadcrumb}>
      <Head title="Processos" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-strong)' }}>Processos</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Central de cadastros e acompanhamento</p>
        </div>

        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Área de atuação</label>
          <select value={setorSelecionado} onChange={(e) => persistSetor(e.target.value)} className="gpdl-input-contrast px-3 py-2 rounded-md">
            <option value="">Selecione</option>
            {setores.map((s) => <option key={s.id} value={String(s.id)}>{s.nome}</option>)}
          </select>
        </div>
      </div>

      {flashSuccessLocal && (
        <Alert variant="success" className="relative mb-4">
          <AlertDescription>{flashSuccessLocal}</AlertDescription>
          <button type="button" onClick={() => setFlashSuccessLocal('')} className="absolute top-2 right-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
        </Alert>
      )}

      {flashErrorLocal && (
        <Alert variant="destructive" className="relative mb-4">
          <AlertDescription>{flashErrorLocal}</AlertDescription>
        </Alert>
      )}

      <CadastroView
        setorSelecionado={setorSelecionado}
        procuradores={page.props?.procuradores ?? procuradores}
        tribunais={page.props?.tribunais ?? []}
        acoes={page.props?.acoes ?? []}
        orgaos={page.props?.orgaos ?? []}
        orgaosJulgadores={page.props?.orgaosJulgadores ?? []}
      />
    </GPDLLayout>
  );
}
