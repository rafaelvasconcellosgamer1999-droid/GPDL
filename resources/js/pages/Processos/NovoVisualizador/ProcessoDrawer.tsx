import { Fragment, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

import AndamentosList from './AndamentosList'
import PartesList from './PartesList'
import IncidenciasList from './IncidenciasList'

type Processo = {
  id: number
  cnj: string
  instancia?: string
  area_atuacao?: string
  data_limite?: string | null
  acao?: { nome: string }
  assunto?: { nome: string }
  andamentos_count: number
  partes_count: number
  incidencias_count: number
}

type Props = {
  processo: Processo | null
  onClose: () => void
}

export default function ProcessoDrawer({ processo, onClose }: Props) {
  const [andamentosOpen, setAndamentosOpen] = useState(false)
  const [partesOpen, setPartesOpen] = useState(false)
  const [incidenciasOpen, setIncidenciasOpen] = useState(false)

  return (
    <AnimatePresence>
      {processo && (
        <Fragment>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* DRAWER */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 w-[380px]
              bg-(--gpdl-sidebar) border-l border-white/10 shadow-xl"
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-white">
                  {processo.cnj}
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  {processo.acao?.nome}
                  {processo.instancia && ` • ${processo.instancia}`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <Section title="Dados do processo">
                <InfoRow label="Área" value={processo.area_atuacao} />
                <InfoRow label="Ação" value={processo.acao?.nome} />
                <InfoRow label="Assunto" value={processo.assunto?.nome} />
                <InfoRow label="Instância" value={processo.instancia} />
                {processo.data_limite && (
                  <InfoRow
                    label="Prazo"
                    value={new Date(processo.data_limite).toLocaleDateString()}
                  />
                )}
              </Section>

              <DropdownSection
                title={`Andamentos (${processo.andamentos_count})`}
                open={andamentosOpen}
                onToggle={setAndamentosOpen}
              >
                <AndamentosList
                  processoId={processo.id}
                  aberto={andamentosOpen}
                />
              </DropdownSection>

              <DropdownSection
                title={`Partes (${processo.partes_count})`}
                open={partesOpen}
                onToggle={setPartesOpen}
              >
                <PartesList
                  processoId={processo.id}
                  aberto={partesOpen}
                />
              </DropdownSection>

              <DropdownSection
                title={`Incidências (${processo.incidencias_count})`}
                open={incidenciasOpen}
                onToggle={setIncidenciasOpen}
              >
                <IncidenciasList
                  processoId={processo.id}
                  aberto={incidenciasOpen}
                />
              </DropdownSection>
            </div>
          </motion.aside>
        </Fragment>
      )}
    </AnimatePresence>
  )
}

/* ===================== */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
        {title}
      </h3>
      <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-white/60">{label}</span>
      <span className="truncate text-white">{value}</span>
    </div>
  )
}

function DropdownSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5">
      <button
        onClick={() => onToggle(!open)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 text-white/70 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/10 px-3 pb-3 py-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
