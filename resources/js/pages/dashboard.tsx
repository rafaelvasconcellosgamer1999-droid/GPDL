import GPDLLayout from '@/layouts/gpdl-layout'
import { dashboard } from '@/routes'
import { type BreadcrumbItem, type SharedData } from '@/types'
import { Head, usePage } from '@inertiajs/react'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
]

export default function Dashboard() {
  const { auth } = usePage<SharedData>().props

  const firstName = auth?.user?.name ? String(auth.user.name).split(' ')[0] : ''

  return (
    <GPDLLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard - GPDL" />

      {/* Hero de boas-vindas */}
      <div className="gpdl-hero mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="gpdl-chip mb-4">
              <span>PAINEL GERAL</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              {`Bem-vindo${firstName ? `, ${firstName}!` : '!'}`}
            </h1>
            <p className="text-white/85 mt-2 text-sm md:text-base">
              Acesse a plataforma para gerenciar seus processos e distribuições.
            </p>
          </div>
        </div>
      </div>
    </GPDLLayout>
  )
}



