import AppLogoIcon from '@/components/app-logo-icon'
import { home } from '@/routes'
import { Link } from '@inertiajs/react'
import { type PropsWithChildren } from 'react'
import { Transition } from '@headlessui/react'

interface AuthLayoutProps {
  title?: string
  description?: string
}

export default function GpdlLoginLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center gpdl-background bg-(--surface-main) px-4 py-10">
      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-[28px] overflow-hidden border border-(--gpdl-border) shadow-(--shadow-card)">
        {/* Coluna esquerda (hero) */}
        <div className="gpdl-hero relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="sphere sphere-1" />
            <div className="sphere sphere-2" />
            <div className="sphere sphere-3" />
          </div>
          <div className="relative z-10 flex flex-col gap-6">
            <div className="gpdl-chip inline-flex items-center gap-2">
              <AppLogoIcon className="h-4 w-4 fill-current" />
              <span>Gerenciador de Processos</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">Simplifique a gest&#227;o do seu time</h1>
            <p className="text-white/85 text-sm md:text-base max-w-md">
              Centralize atividades, acompanhe prazos e mantenha o time alinhado com o fluxo certo de processos.
            </p>
            <ul className="text-white/90 text-sm space-y-2">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-(--success-500)"></span> Vis&#227;o consolidada das demandas</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-(--success-500)"></span> Alertas autom&#225;ticos e integra&#231;&#245;es</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-(--success-500)"></span> Dashboards em tempo real</li>
            </ul>
          </div>
        </div>

        {/* Coluna direita (formulário) */}
        <div className="panel-glass rounded-3xl p-8 md:p-10 m-6">
          <div className="flex items-center justify-between mb-6">
            <Link href={home()} className="inline-flex items-center gap-2 text-(--text-muted)">
              <AppLogoIcon className="h-6 w-6 fill-current" />
              <span className="sr-only">Voltar ao in&iacute;cio</span>
            </Link>
          </div>

          <div className="space-y-1 mb-6">
            <Transition
              appear
              show
              key={(title ?? '') + (description ?? '')}
              enter="transition-all duration-200"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
            >
              <div>
                <h2 className="text-xl font-semibold text-(--text-strong)">{title ?? 'Bem-vindo de volta!'}</h2>
                <p className="text-(--text-muted) text-sm">{description ?? 'Use seu utilizador de rede para acessar.'}</p>
              </div>
            </Transition>
          </div>

          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
