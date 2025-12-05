import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import AuthLayout from '@/layouts/auth-layout'
import * as React from 'react'
import { store } from '@/routes/login'
import { request } from '@/routes/password'
import { Form, Head } from '@inertiajs/react'
import { Transition } from '@headlessui/react'
import { Eye, EyeOff } from 'lucide-react'

interface LoginProps {
  status?: string
  canResetPassword: boolean
  canRegister: boolean
}

export default function Login({ status, canResetPassword, /*canRegister*/ }: LoginProps) {
  const [view, setView] = React.useState<'login' | 'request'>('login')
  const [showPassword, setShowPassword] = React.useState(false)

  const title = view === 'login' ? 'Bem-vindo de volta!' : 'Solicitar acesso'
  const description =
    view === 'login'
      ? 'Use seu utilizador de rede para acessar.'
      : 'Preencha seus dados e aguarde a liberação pelo time de suporte.'

  return (
    <AuthLayout title={title} description={description}>
      <Head title="Entrar" />

      {/* Toggle de abas (Entrar | Solicitar acesso) */}
      <div className="gpdl-pill-group gpdl-segmented mb-6 w-full h-11" role="tablist" aria-label="Alternar entre entrar e solicitar acesso">
        <span
          className="gpdl-pill-thumb"
          style={{ transform: view === 'login' ? 'translateX(0)' : 'translateX(calc(100% + var(--seg-gap)))' }}
          aria-hidden="true"
        />
        <button
          type="button"
          role="tab"
          onClick={() => setView('login')}
          className={`gpdl-pill font-medium h-9 flex-1 flex items-center justify-center relative z-1 ${view === 'login' ? 'is-active' : ''}`}
          aria-selected={view === 'login'}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => setView('request')}
          className={`gpdl-pill font-medium h-9 flex-1 flex items-center justify-center relative z-1 ${view === 'request' ? 'is-active' : ''}`}
          aria-selected={view === 'request'}
        >
          Solicitar acesso
        </button>
      </div>

      {/* Área de conteúdo com forms sobrepostos para evitar flicker */}
      <div className="relative min-h-[380px]">
        <Transition
          appear
          show={view === 'login'}
          enter="transition-all duration-300"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition-all duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <div className="absolute inset-0">
            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
              {({ processing, errors }) => (
                <>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Usu&aacute;rio de Rede</Label>
                      <Input
                        className="gpdl-input-icy pr-10"
                        id="email"
                        type="text"
                        name="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="username"
                        placeholder="nome.sobrenome"
                      />
                      <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Senha</Label>
                        {canResetPassword && (
                          <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
                            Esqueci minha senha
                          </TextLink>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          className="gpdl-input-icy pr-10"
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          tabIndex={2}
                          autoComplete="current-password"
                          placeholder="Senha"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={6}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox id="remember" name="remember" tabIndex={3} />
                      <Label htmlFor="remember">Lembrar de mim</Label>
                    </div>

                    <Button
                      type="submit"
                      className="mt-2 w-full btn-gradient"
                      tabIndex={4}
                      disabled={processing}
                      data-test="login-button"
                    >
                      {processing && <Spinner />}
                      Entrar
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </div>
        </Transition>

        <Transition
          appear
          show={view === 'request'}
          enter="transition-all duration-300"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition-all duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <div className="absolute inset-0">
            <Form action="/solicitar-acesso" method="post" resetOnSuccess={['nome','usuarioRede','email']} disableWhileProcessing className="flex flex-col gap-6">
              {({ processing, errors }) => (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input id="nome" name="nome" type="text" placeholder="Nome Sobrenome" className="gpdl-input-icy" required />
                    <InputError message={errors.nome} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="usuarioRede">Utilizador da rede</Label>
                    <Input id="usuarioRede" name="usuarioRede" type="text" placeholder="nome.sobrenome" className="gpdl-input-icy" required />
                    <InputError message={errors.usuarioRede} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emailReq">Email</Label>
                    <Input id="emailReq" name="email" type="email" placeholder="email@exemplo.com" className="gpdl-input-icy" required />
                    <InputError message={errors.email} />
                  </div>
                  <Button type="submit" className="mt-2 w-full btn-gradient" disabled={processing}>
                    Enviar solicita&ccedil;&atilde;o
                  </Button>
                  <p className="text-xs text-muted-foreground">O time de suporte libera os acessos em at&eacute; 1 dia &uacute;til.</p>
                </>
              )}
            </Form>
          </div>
        </Transition>
      </div>

      {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
    </AuthLayout>
  )
}











