import React, { useEffect, useState } from 'react';

// ProcessViewer.tsx
// Versão adaptada ao design system GPDL (usa variáveis CSS e classes utilitárias fornecidas)
// - Não faz chamadas à API; recebe os processos via prop `processes`.
// - Usa classes como `gpdl-card`, `gpdl-input-contrast`, `btn-gradient`, `deadline-tag` etc.

export type Andamento = { id: number | string; titulo?: string; data?: string; descricao?: string };
export type Incidencia = { id: number | string; tipo?: string; data?: string; descricao?: string };

export type Processo = {
  id: number | string;
  cnj?: string | null;
  tipo_processo?: string | null;
  municipio?: string | null;
  tribunal?: { id: number; nome: string } | null;
  acao?: { id: number; nome: string } | null;
  assunto?: { id: number; nome: string } | null;
  instancia?: string | null;
  procurador_responsavel?: { id: number; name?: string } | null;
  status?: string | null;
  prazo?: string | null;
  data_limite?: string | null;
  incidencias_count?: number;
  andamentos_count?: number;
  andamentos?: Andamento[];
  incidencias?: Incidencia[];
};

const mockProcesses: Processo[] = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  cnj: `0000000-0.2025.8.00.000${i + 1}`,
  tipo_processo: i % 2 === 0 ? 'pje' : 'federal',
  municipio: 'São Paulo',
  tribunal: { id: 1, nome: 'TRF-3' },
  acao: { id: 10, nome: i % 2 === 0 ? 'Ação Ordinária' : 'Mandado' },
  assunto: { id: 20, nome: 'Assunto Exemplo' },
  instancia: i % 3 === 0 ? '1ª Instância' : '2ª Instância',
  prazo: new Date(Date.now() + (i + 3) * 86400000).toISOString().slice(0, 10),
  procurador_responsavel: { id: 2, name: `Procurador ${i + 1}` },
  status: i % 2 === 0 ? 'em andamento' : 'finalizado',
  incidencias_count: Math.floor(Math.random() * 4),
  andamentos_count: Math.floor(Math.random() * 6),
  andamentos: Array.from({ length: Math.floor(Math.random() * 4) }).map((__, j) => ({
    id: `${i}-a-${j}`,
    titulo: `Andamento ${j + 1}`,
    data: new Date(Date.now() - j * 86400000).toISOString().slice(0, 10),
    descricao: `Descrição do andamento ${j + 1}`,
  })),
  incidencias: Array.from({ length: Math.floor(Math.random() * 3) }).map((__, j) => ({
    id: `${i}-i-${j}`,
    tipo: j % 2 === 0 ? 'Petição' : 'Despacho',
    data: new Date(Date.now() - j * 172800000).toISOString().slice(0, 10),
    descricao: `Descrição da incidência ${j + 1}`,
  })),
}));

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-[var(--text-muted)] w-28">{label}</div>
      <div className="text-sm font-medium truncate text-[var(--text-strong)]">{value ?? '—'}</div>
    </div>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--surface-muted)', color: 'var(--text-strong)', border: '1px solid var(--gpdl-border)' }}>
      {children}
    </span>
  );
}

function ProcessCard({ processo, onOpen }: { processo: Processo; onOpen: (p: Processo) => void }) {
  return (
    <button
      onClick={() => onOpen(processo)}
      className="w-full p-4 rounded-xl gpdl-card flex items-center justify-between gap-4 text-left focus:outline-none"
      style={{ borderColor: 'var(--gpdl-border)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold truncate text-[var(--text-strong)]">{processo.cnj ?? `#${processo.id}`}</div>
          <div className="ml-2 text-xs text-[var(--text-muted)]">{processo.instancia}</div>
          {processo.tipo_processo && <div className="ml-2 text-xs text-[var(--text-muted)] capitalize">{processo.tipo_processo}</div>}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className="text-[var(--text-muted)]">
            <div className="text-xs">Ação / Assunto</div>
            <div className="truncate text-[var(--text-strong)]">{processo.acao?.nome ?? processo.assunto?.nome ?? '—'}</div>
          </div>
          <div className="text-[var(--text-muted)]">
            <div className="text-xs">Prazo</div>
            <div className="truncate text-[var(--text-strong)]">{processo.prazo ?? processo.data_limite ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <CountBadge>{processo.incidencias_count ?? (processo.incidencias?.length ?? 0)} incid.</CountBadge>
        <CountBadge>{processo.andamentos_count ?? (processo.andamentos?.length ?? 0)} andam.</CountBadge>
      </div>
    </button>
  );
}

function RightDrawer({ open, processo, onClose }: { open: boolean; processo: Processo | null; onClose: () => void }) {
  const [showAndamentos, setShowAndamentos] = useState(true);
  const [showIncidencias, setShowIncidencias] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowAndamentos(true);
    setShowIncidencias(false);
  }, [open, processo?.id]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-[44%] lg:w-[36%] transform transition-transform duration-200 ease-in-out z-40 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!open}
    >
      <div className="p-4 flex items-center justify-between border-b" style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--gpdl-border)' }}>
        <h3 className="text-lg font-semibold text-[var(--text-strong)]">Detalhes do Processo</h3>
        <div>
          <button onClick={onClose} className="px-3 py-1 rounded-md text-sm">Fechar</button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100%-64px)]" style={{ background: 'var(--surface-main)' }}>
        {!processo ? (
          <div className="text-sm text-[var(--text-muted)]">Selecione um processo para ver os detalhes.</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-[var(--text-muted)]">CNJ / Número</div>
              <div className="text-lg font-semibold truncate text-[var(--text-strong)]">{processo.cnj ?? `#${processo.id}`}</div>
              <div className="text-sm text-[var(--text-muted)]">{processo.assunto?.nome ?? processo.acao?.nome}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Ação" value={processo.acao?.nome} />
              <InfoRow label="Assunto" value={processo.assunto?.nome} />
              <InfoRow label="Instância" value={processo.instancia} />
              <InfoRow label="Tribunal" value={processo.tribunal?.nome} />
              <InfoRow label="Prazo" value={processo.prazo ?? processo.data_limite} />
              <InfoRow label="Procurador" value={processo.procurador_responsavel?.name} />
              <InfoRow label="Status" value={<span className={`deadline-tag ${processo.status === 'finalizado' ? 'deadline-ok' : processo.status === 'em andamento' ? 'deadline-warn' : 'deadline-danger'}`}>{processo.status}</span>} />
              <InfoRow label="Município" value={processo.municipio} />
            </div>

            <div className="border rounded-md" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-card)' }}>
              <button onClick={() => setShowAndamentos(s => !s)} className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium">
                <span>Andamentos — {processo.andamentos_count ?? (processo.andamentos?.length ?? 0)}</span>
                <span className="text-[var(--text-muted)]">{showAndamentos ? '▲' : '▼'}</span>
              </button>

              {showAndamentos && (
                <div className="px-4 pb-3 pt-2 space-y-2">
                  {processo.andamentos && processo.andamentos.length > 0 ? (
                    processo.andamentos.map(a => (
                      <div key={String(a.id)} className="p-2 rounded-md" style={{ background: 'var(--surface-muted)', border: '1px solid var(--gpdl-border)' }}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-[var(--text-strong)]">{a.titulo ?? 'Andamento'}</div>
                          <div className="text-xs text-[var(--text-muted)]">{a.data}</div>
                        </div>
                        {a.descricao && <div className="text-sm text-[var(--text-muted)] mt-1">{a.descricao}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[var(--text-muted)]">Nenhum andamento registrado.</div>
                  )}
                </div>
              )}
            </div>

            <div className="border rounded-md" style={{ borderColor: 'var(--gpdl-border)', background: 'var(--surface-card)' }}>
              <button onClick={() => setShowIncidencias(s => !s)} className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium">
                <span>Incidências — {processo.incidencias_count ?? (processo.incidencias?.length ?? 0)}</span>
                <span className="text-[var(--text-muted)]">{showIncidencias ? '▲' : '▼'}</span>
              </button>

              {showIncidencias && (
                <div className="px-4 pb-3 pt-2 space-y-2">
                  {processo.incidencias && processo.incidencias.length > 0 ? (
                    processo.incidencias.map(i => (
                      <div key={String(i.id)} className="p-2 rounded-md" style={{ background: 'var(--surface-muted)', border: '1px solid var(--gpdl-border)' }}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-[var(--text-strong)]">{i.tipo ?? 'Incidência'}</div>
                          <div className="text-xs text-[var(--text-muted)]">{i.data}</div>
                        </div>
                        {i.descricao && <div className="text-sm text-[var(--text-muted)] mt-1">{i.descricao}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[var(--text-muted)]">Nenhuma incidência registrada.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProcessViewer({ fetchUrl, processes }: { fetchUrl?: string; processes?: Processo[] }) {
  const [list, setList] = useState<Processo[]>(processes ?? mockProcesses);
  const [selected, setSelected] = useState<Processo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (processes) setList(processes);
  }, [processes]);

  useEffect(() => {
    if (!fetchUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(fetchUrl, { credentials: 'same-origin' })
      .then(async res => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (!cancelled) {
          setList(Array.isArray(data) ? data : data.data ?? []);
        }
      })
      .catch(err => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchUrl]);

  function openDrawer(p: Processo) {
    setSelected(p);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 220);
  }

  return (
    <div className="relative flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Processos</h2>
          <div className="text-sm text-[var(--text-muted)]">{loading ? 'Carregando...' : `${list.length} resultados`}</div>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">Erro ao carregar: {error}</div>}

        <div className="space-y-3">
          {list.map(p => (
            <ProcessCard key={String(p.id)} processo={p} onOpen={openDrawer} />
          ))}
        </div>
      </div>

      <RightDrawer open={drawerOpen} processo={selected} onClose={closeDrawer} />
    </div>
  );
}
