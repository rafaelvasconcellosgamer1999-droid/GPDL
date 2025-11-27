import { Head, Link } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';

export default function Forbidden({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-main)] text-[var(--text-strong)]">
      <Head title="Acesso negado" />
      <ShieldOff className="w-16 h-16 mb-4 text-red-500" />
      <h1 className="text-3xl font-bold mb-2">Acesso negado</h1>
      <p className="text-base opacity-80 mb-6">{message || 'Você não tem permissão para visualizar esta página.'}</p>
      <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white transition-colors">
        Voltar ao início
      </Link>
    </div>
  );
}
