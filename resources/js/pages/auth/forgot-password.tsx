// Components
import { login } from '@/routes'
import { email } from '@/routes/password'
import { Form, Head } from '@inertiajs/react'
import { LoaderCircle } from 'lucide-react'

import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword({ status }: { status?: string }) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center gpdl-background bg-(--surface-main) px-4 py-10">
      <Head title="Recuperar senha" />

      <div className="panel-glass rounded-3xl p-6 md:p-8 w-full max-w-md border border-(--gpdl-border) shadow-(--shadow-card)">
        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-semibold text-white">Recuperar senha</h2>
          <p className="text-white/80 text-sm">Informe seu e-mail corporativo ou usu&aacute;rio de rede. Geraremos uma nova senha tempor&aacute;ria para voc&ecirc;.</p>
        </div>

        {status && (
          <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>
        )}

        <Form {...email.form()} className="flex flex-col gap-6">
          {({ processing, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="email">Email ou usu&aacute;rio de rede</Label>
                <Input
                  id="email"
                  type="text"
                  name="email"
                  autoComplete="off"
                  autoFocus
                  placeholder="email@empresa.com ou nome.sobrenome"
                  className="gpdl-input-icy"
                />
                <InputError message={errors.email} />
              </div>

              <Button className="w-full btn-gradient" disabled={processing} data-test="email-password-reset-link-button">
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Gerar senha tempor&aacute;ria
              </Button>
            </>
          )}
        </Form>

        <div className="mt-4 text-center text-sm text-white/80">
          <TextLink href={login()} className="text-white/80 hover:text-white">Voltar para o login</TextLink>
        </div>
      </div>
    </div>
  )
}
