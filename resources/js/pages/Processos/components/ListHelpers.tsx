// resources/js/Pages/Processos/components/ListHelpers.tsx
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react'; // Link removido pois não é mais usado aqui

/* -------------------------- Tipos exportados -------------------------- */
export type Procurador = { id: number; nome: string };

export type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

export type Paginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from?: number;
  to?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  links: PaginationLink[];
};

export type FiltersForm = {
  responsavel_id: string;
  order: string;
  per_page: string;
  view?: string;
};

export type ProcessoRow = {
  id: number;
  orgao?: string | null;
  acao?: string | null;
  numero?: string | null;
  assunto?: string | null;
  vara_juizo?: string | null;
  partes_envolvidas?: string | null;
  data_limite?: string | null;
  data_ciencia?: string | null;
  ultimo_mov_texto?: string | null;
  responsavel_nome?: string | null;
  // CAMPOS DE STATUS
  data_finalizacao?: string | null;
  finalizado_em?: string | null;
  concluido?: number | boolean | null;
};

/* -------------------------- Toolbar -------------------------- */
export function Toolbar({
  filtros,
  setF,
  onApply,
  onClear,
  procuradores,
}: {
  filtros: FiltersForm;
  setF: (k: keyof FiltersForm, v: string) => void;
  onApply: () => void;
  onClear: () => void;
  procuradores: Procurador[];
}) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-(--gpdl-border) bg-(--surface-card) p-3">
        <div className="min-w-[220px]">
          <label className="mb-1 block text-xs text-(--text-muted)">Responsável</label>
          <select
            value={filtros.responsavel_id}
            onChange={(e) => {
              const value = e.target.value;
              setF('responsavel_id', value);
              const q = new URLSearchParams(window.location.search);
              q.set('view', filtros.view || 'ativos');
              if (value.trim() !== '') q.set('responsavel_id', value);
              else q.delete('responsavel_id');
              if (filtros.order) q.set('order', filtros.order);
              if (filtros.per_page) q.set('per_page', filtros.per_page);
              router.get(`/processos?${q.toString()}`, {}, { preserveScroll: true, preserveState: false, replace: true });
            }}
            className="gpdl-input-contrast px-3 py-2"
          >
            <option value="">Todos</option>
            {procuradores.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[220px]">
          <label className="mb-1 block text-xs text-(--text-muted)">Ordenar por</label>
          <select
            value={filtros.order}
            onChange={(e) => {
              setF('order', e.target.value);
              setTimeout(() => onApply && onApply(), 0);
            }}
            className="gpdl-input-contrast px-3 py-2"
          >
            <option value="prazo_asc">Prazo (mais urgente)</option>
            <option value="created_desc">Recentes primeiro</option>
          </select>
        </div>

        <button onClick={onClear} className="rounded-lg border border-(--gpdl-border) bg-(--surface-muted) px-3 py-2 hover:border-(--brand-600) transition-colors opacity-70 hover:opacity-100">
          Limpar
        </button>
      </div>
    </div>
  );
}

/* -------------------------- TableList -------------------------- */
export function TableList({
  itens,
  empty,
  showActions = false,
  onFinalize,
  finalizingId,
}: {
  itens: ProcessoRow[];
  empty: string;
  showActions?: boolean;
  onFinalize?: (id: number) => void;
  finalizingId?: number | null;
}) {
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function Countdown({ value }: { value?: string | null }) {
    const [now, setNow] = useState<number>(() => Date.now());
    useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(id);
    }, []);
    
    if (!value) return <span>-</span>;
    const str = String(value).replace(' ', 'T');
    const target = new Date(str);
    if (isNaN(target.getTime())) return <span>{String(value)}</span>;
    
    const diff = target.getTime() - now;
    const past = diff < 0;
    const abs = Math.abs(diff);
    
    const totalSeconds = Math.floor(abs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    const text = days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
    const cls = past ? 'deadline-tag deadline-danger' : abs <= 86400000 ? 'deadline-tag deadline-warn' : 'deadline-tag deadline-ok';
    return (
      <span className={cls}>
        {past ? 'Vencido há ' : 'Em '}
        {text}
      </span>
    );
  }

  function formatBrDate(value?: string | null) {
    if (!value) return '-';
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/.exec(String(value));
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    const m2 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value));
    if (m2) return String(value);
    const d = new Date(String(value));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
    return String(value);
  }

  if (!itens || itens.length === 0) return <p className="text-sm text-(--text-muted) p-4">{empty}</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-(--gpdl-border)">
      <table className="min-w-full divide-y divide-(--gpdl-border)">
        <thead>
          <tr className="bg-(--surface-muted)">
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Orgao</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Acao</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Numero</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Assunto</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Vara/Juizo</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Partes envolvidas</th>
            <th className="px-4 py-2 text-center text-xs text-(--text-muted) uppercase">Prazo</th>
            <th className="px-4 py-2 text-center text-xs text-(--text-muted) uppercase">Ciencia</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Ultimo movimento</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Responsavel</th>
            {showActions && <th className="px-4 py-2 text-right text-xs text-(--text-muted) uppercase">Acoes</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--gpdl-border) bg-(--surface-card)">
          {itens.map((p) => {
            // Lógica de Status: Verifica se está finalizado para mudar a tag de prazo
            const isFinalizado = !!(p.data_finalizacao || p.finalizado_em || p.concluido);

            return (
              <tr key={p.id} className="hover:bg-(--surface-muted) transition-colors">
                <td className="px-4 py-2 text-sm">{p.orgao ?? '-'}</td>
                <td className="px-4 py-2 text-sm">{p.acao ?? '-'}</td>
                
                {/* --- MUDANÇA: Número agora é apenas texto, não clicável --- */}
                <td className="px-4 py-2 text-sm">{p.numero ?? p.id}</td>

                <td className="px-4 py-2 text-sm truncate max-w-[150px]" title={p.assunto || ''}>{p.assunto ?? '-'}</td>
                <td className="px-4 py-2 text-sm truncate max-w-[120px]" title={p.vara_juizo || ''}>{p.vara_juizo ?? '-'}</td>
                <td className="px-4 py-2 text-sm truncate max-w-[150px]" title={p.partes_envolvidas || ''}>{p.partes_envolvidas ?? '-'}</td>
                
                {/* Coluna Prazo com lógica de finalizado */}
                <td className="px-4 py-2 text-sm text-center">
                  {(() => {
                    if (isFinalizado) return <span className="deadline-tag deadline-ok">Finalizado</span>;
                    if (!p.data_limite) return <span className="deadline-tag deadline-warn">Pendente</span>;
                    
                    const str = String(p.data_limite).replace(' ', 'T');
                    const target = new Date(str);
                    if (!isNaN(target.getTime()) && target.getTime() < nowTick) return <span className="deadline-tag deadline-danger">Prazo vencido</span>;
                    
                    return <Countdown value={p.data_limite} />;
                  })()}
                </td>

                <td className="px-4 py-2 text-sm">{formatBrDate(p.data_ciencia)}</td>
                <td className="px-4 py-2 text-sm">{p.ultimo_mov_texto ?? '-'}</td>
                <td className="px-4 py-2 text-sm">{p.responsavel_nome ?? '-'}</td>
                
                {showActions && (
                  <td className="px-4 py-2 text-sm text-right">
                    {!isFinalizado && onFinalize && (
                        <button
                            onClick={() => onFinalize(p.id)}
                            disabled={!!finalizingId && finalizingId === p.id}
                            className="text-xs font-bold text-(--accent-success) hover:underline disabled:opacity-50"
                        >
                            {finalizingId === p.id ? '...' : 'Finalizar'}
                        </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------- TablePlaceholder -------------------------- */
export function TablePlaceholder() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-(--gpdl-border)">
        <thead>
          <tr className="bg-(--surface-muted)">
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">No</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Assunto</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Interessado</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Setor</th>
            <th className="px-4 py-2 text-left text-xs text-(--text-muted) uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--gpdl-border)">
          {[1, 2, 3].map((i) => (
            <tr key={i} className="hover:bg-(--surface-muted)">
              <td className="px-4 py-2 text-sm">2025.00{i}</td>
              <td className="px-4 py-2 text-sm">Lorem ipsum dolor {i}</td>
              <td className="px-4 py-2 text-sm">-</td>
              <td className="px-4 py-2 text-sm">-</td>
              <td className="px-4 py-2 text-sm">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------- Pager -------------------------- */
export function Pager({ meta }: { meta?: Paginator<unknown> }) {
  if (!meta || !meta.links || meta.total <= meta.per_page) return null;
  const showing = meta.to && meta.from ? meta.to - meta.from + 1 : meta.data.length;
  
  const go = (url?: string | null) => {
    if (!url) return;
    router.get(url, {}, { preserveScroll: true, preserveState: false, replace: true });
  };
  
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-(--text-muted)">
      <div>Mostrando {showing} de {meta.total} processos</div>
      <div className="flex items-center gap-2">
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            {meta.links.map((link, i) => {
                const label = link.label.replace('&laquo;', '').replace('&raquo;', '').replace('Previous', 'Ant').replace('Next', 'Prox').trim();
                
                if (!link.url) {
                    return (
                        <span key={i} className="relative inline-flex items-center px-3 py-1 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-(--gpdl-border) opacity-50 cursor-default">
                            {label}
                        </span>
                    );
                }
                return (
                    <button
                        key={i}
                        onClick={() => go(link.url)}
                        className={`relative inline-flex items-center px-3 py-1 text-sm font-semibold ring-1 ring-inset ring-(--gpdl-border) focus:z-20 focus:outline-offset-0 
                            ${link.active 
                                ? 'z-10 bg-(--brand-600) text-white focus-visible:outline-2 focus-visible:outline-(--brand-600)' 
                                : 'text-(--text-strong) hover:bg-(--surface-muted)'}`}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
      </div>
    </div>
  );
}