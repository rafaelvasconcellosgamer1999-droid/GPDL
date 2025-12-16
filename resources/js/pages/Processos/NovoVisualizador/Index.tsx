import { useState } from 'react'
import { Head } from '@inertiajs/react'
import GPDLLayout from '@/layouts/gpdl-layout'
import ProcessoCard from './ProcessoCard'
import ProcessoDrawer from './ProcessoDrawer'

type Processo = {
  id: number
  cnj: string
  instancia?: string
  data_limite?: string | null
  acao?: {
    id: number
    nome: string
  }
  assunto?: {
    id: number
    nome: string
  }
  andamentos_count: number
  partes_count: number
  incidencias_count: number
}

/* ======================
   PAGINAÇÃO INERTIA
   ====================== */

type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

type PaginationMeta = {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
}

type Paginated<T> = {
  data: T[]
  links: PaginationLink[]
  meta: PaginationMeta
}

type Props = {
  processos: Paginated<Processo>
}

export default function Index({ processos }: Props) {
  const [selectedProcesso, setSelectedProcesso] =
    useState<Processo | null>(null)

  return (
    <GPDLLayout>
      <Head title="Processos" />

      <div className="flex h-full">
        {/* LISTA */}
        <div className="flex-1 overflow-y-auto pr-[380px]">
          <div className="space-y-3 p-6">
            {processos.data.map((processo) => (
              <ProcessoCard
                key={processo.id}
                processo={processo}
                active={selectedProcesso?.id === processo.id}
                onSelect={() => setSelectedProcesso(processo)}
              />
            ))}
          </div>
        </div>

        {/* DRAWER */}
        {selectedProcesso && (
          <ProcessoDrawer
            processo={selectedProcesso}
            onClose={() => setSelectedProcesso(null)}
          />
        )}
      </div>
    </GPDLLayout>
  )
}
