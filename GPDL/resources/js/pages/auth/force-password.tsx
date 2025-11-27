import { Form, Head } from '@inertiajs/react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputError from '@/components/input-error'

export default function ForcePassword() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center gpdl-background bg-[var(--surface-main)] px-4 py-10">
      <Head title="Crie uma nova senha" />

      <div className="panel-glass rounded-3xl p-6 md:p-8 w-full max-w-md border border-[var(--gpdl-border)] shadow-[var(--shadow-card)]">
        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-semibold text-white">Crie uma nova senha</h2>
          <p className="text-white/80 text-sm">Por seguran&ccedil;a, voc&ecirc; precisa definir uma nova senha para o seu primeiro acesso.</p>
        </div>

        <Form action="/trocar-senha" method="post" className="flex flex-col gap-6" resetOnSuccess>
          {({ processing, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input id="password" name="password" type="password" placeholder="M&iacute;nimo de 8 caracteres" className="gpdl-input-icy" required />
                <InputError message={errors.password} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                <Input id="password_confirmation" name="password_confirmation" type="password" placeholder="Repita a nova senha" className="gpdl-input-icy" required />
                <InputError message={errors.password_confirmation} />
              </div>

              <Button type="submit" className="w-full btn-gradient" disabled={processing}>
                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Salvar e acessar
              </Button>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}

