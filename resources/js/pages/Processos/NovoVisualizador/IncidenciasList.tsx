import { useEffect, useState } from 'react'
import { Loader2, GitBranch } from 'lucide-react'
import axios from 'axios'
import clsx from 'clsx'

type Incidencia = {
  id: number
  cnj: string
  descricao?: string | null
  status?: string | null
  created_at?: string
}

type Props = {
  processoId: number
  aberto: boolean
}

export default function IncidenciasList({ processoId, aberto }: Props) {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(false)


  useEffect(() => {
  if (!aberto) return

  let ativo = true

  async function fetchIncidencias() {
    try {
      setLoading(true)
      setErro(false)

      const res = await axios.get(`/processos/${processoId}/incidencias`)
      if (ativo) {
        setIncidencias(res.data)
      }
    } catch {
      if (ativo) setErro(true)
    } finally {
      if (ativo) setLoading(false)
    }
  }

  fetchIncidencias()

  return () => {
    ativo = false
  }
}, [aberto, processoId])

  if (!aberto) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando incidências...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-xs text-red-400">
        Erro ao carregar as incidências do processo.
      </div>
    )
  }

  if (!incidencias.length) {
    return (
      <div className="rounded-md border border-white/10 p-3 text-xs text-white/60">
        Nenhuma incidência registrada.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {incidencias.map((inc) => (
        <li
          key={inc.id}
          className="rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-start gap-2">
            <GitBranch className="h-4 w-4 text-white/70 mt-0.5 shrink-0" />

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white">
                  {inc.cnj}
                </span>

                {inc.status && (
                  <span
                    className={clsx(
                      'rounded px-2 py-0.5 text-[10px] uppercase tracking-wide',
                      inc.status === 'aberta'
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : inc.status === 'resolvida'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/10 text-white/60'
                    )}
                  >
                    {inc.status}
                  </span>
                )}
              </div>

              {inc.descricao && (
                <p className="mt-1 text-xs text-white/70">
                  {inc.descricao}
                </p>
              )}

              {inc.created_at && (
                <div className="mt-2 text-[11px] text-white/40">
                  Criada em{' '}
                  {new Date(inc.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
