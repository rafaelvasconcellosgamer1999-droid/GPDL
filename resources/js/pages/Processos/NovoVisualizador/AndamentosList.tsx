import { useEffect, useState } from 'react'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import axios from 'axios'

type Andamento = {
  id: number
  descricao: string
  tipo_andamento?: string
  tipo_movimentacao?: string
  data_andamento?: string | null
  data_prazo?: string | null
  status?: string
}

type Props = {
  processoId: number
  aberto: boolean
}

export default function AndamentosList({ processoId, aberto }: Props) {
  const [andamentos, setAndamentos] = useState<Andamento[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(false)

  useEffect(() => {
  if (!aberto) return

  let ativo = true

  async function fetchAndamentos() {
    try {
      setLoading(true)
      setErro(false)

      const res = await axios.get(`/processos/${processoId}/andamentos`)
      if (ativo) {
        setAndamentos(res.data)
      }
    } catch {
      if (ativo) setErro(true)
    } finally {
      if (ativo) setLoading(false)
    }
  }

  fetchAndamentos()

  return () => {
    ativo = false
  }
}, [aberto, processoId])

  if (!aberto) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando andamentos...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-xs text-red-400">
        Erro ao carregar os andamentos.
      </div>
    )
  }

  if (!andamentos.length) {
    return (
      <div className="rounded-md border border-white/10 p-3 text-xs text-white/60">
        Nenhum andamento registrado.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {andamentos.map((andamento) => {
        const prazoVencido =
          andamento.data_prazo &&
          new Date(andamento.data_prazo) < new Date()

        return (
          <li
            key={andamento.id}
            className="rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <p className="text-sm text-white leading-snug">
              {andamento.descricao}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
              {andamento.tipo_andamento && (
                <span>{andamento.tipo_andamento}</span>
              )}

              {andamento.tipo_movimentacao && (
                <span>• {andamento.tipo_movimentacao}</span>
              )}

              {andamento.data_andamento && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(andamento.data_andamento).toLocaleDateString()}
                </span>
              )}

              {andamento.data_prazo && (
                <span
                  className={clsx(
                    'flex items-center gap-1',
                    prazoVencido ? 'text-red-400' : 'text-amber-400'
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Prazo:{' '}
                  {new Date(andamento.data_prazo).toLocaleDateString()}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
