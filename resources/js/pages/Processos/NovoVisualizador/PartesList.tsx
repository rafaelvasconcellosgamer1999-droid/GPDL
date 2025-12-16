import { useEffect, useState } from 'react'
import { Loader2, User, Users, IdCard } from 'lucide-react'
import axios from 'axios'
import clsx from 'clsx'

type Parte = {
  id: number
  nome: string
  tipo?: string
  documento?: string | null
  principal?: boolean
}

type Props = {
  processoId: number
  aberto: boolean
}

export default function PartesList({ processoId, aberto }: Props) {
  const [partes, setPartes] = useState<Parte[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(false)

  useEffect(() => {
  if (!aberto) return

  let ativo = true

  async function fetchPartes() {
    try {
      setLoading(true)
      setErro(false)

      const res = await axios.get(`/processos/${processoId}/partes`)
      if (ativo) {
        setPartes(res.data)
      }
    } catch {
      if (ativo) setErro(true)
    } finally {
      if (ativo) setLoading(false)
    }
  }

  fetchPartes()

  return () => {
    ativo = false
  }
}, [aberto, processoId])

  if (!aberto) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando partes...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-xs text-red-400">
        Erro ao carregar as partes do processo.
      </div>
    )
  }

  if (!partes.length) {
    return (
      <div className="rounded-md border border-white/10 p-3 text-xs text-white/60">
        Nenhuma parte cadastrada.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {partes.map((parte) => {
        const Icon = parte.tipo === 'coletivo' ? Users : User

        return (
          <li
            key={parte.id}
            className={clsx(
              'flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3'
            )}
          >
            <Icon className="h-4 w-4 mt-0.5 text-white/70 shrink-0" />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">
                  {parte.nome}
                </span>

                {parte.principal && (
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                    Principal
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/60">
                {parte.tipo && <span>{parte.tipo}</span>}

                {parte.documento && (
                  <span className="flex items-center gap-1">
                    <IdCard className="h-3.5 w-3.5" />
                    {parte.documento}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
