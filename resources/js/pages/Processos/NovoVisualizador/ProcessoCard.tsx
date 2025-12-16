import clsx from 'clsx'
import { Calendar, FileText, Layers, Users } from 'lucide-react'

type Processo = {
  id: number
  cnj: string
  instancia?: string
  data_limite?: string | null
  acao?: {
    nome: string
  }
  andamentos_count: number
  partes_count: number
  incidencias_count: number
}

type Props = {
  processo: Processo
  active?: boolean
  onSelect: () => void
}

export default function ProcessoCard({ processo, active, onSelect }: Props) {
  const prazoVencido =
    processo.data_limite &&
    new Date(processo.data_limite) < new Date()

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full text-left rounded-xl border transition-all',
        'bg-white/5 hover:bg-white/10',
        'border-white/10',
        active && 'ring-2 ring-primary/60 bg-white/10'
      )}
    >
      <div className="flex items-center justify-between gap-4 p-4">
        {/* ESQUERDA */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-white/60" />
            <strong className="truncate text-sm text-white">
              {processo.cnj || 'Processo sem número'}
            </strong>
          </div>

          <div className="mt-1 text-xs text-white/70 space-x-2">
            {processo.acao?.nome && (
              <span>{processo.acao.nome}</span>
            )}
            {processo.instancia && (
              <span>• {processo.instancia}</span>
            )}
          </div>

          {processo.data_limite && (
            <div
              className={clsx(
                'mt-2 inline-flex items-center gap-1 text-xs',
                prazoVencido ? 'text-red-400' : 'text-amber-400'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Prazo: {new Date(processo.data_limite).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* DIREITA */}
        <div className="flex items-center gap-6 text-xs text-white/80">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>{processo.incidencias_count}</span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{processo.partes_count}</span>
          </div>

          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{processo.andamentos_count}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
