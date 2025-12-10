import { Link } from '@inertiajs/react';

const items = [
  { href: '/admin/solicitacoes', label: 'Solicitações' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/setores', label: 'Setores' },
  { href: '/admin/cargos', label: 'Cargos' },
  { href: '/admin/permissoes', label: 'Permissões' },
  { href: '/admin/regras', label: 'Regras' },
  { href: '/admin/tematicas', label: 'Tematicas' },
  { href: '/admin/entidades-juridicas', label: 'Entidades' },
];

export function AdminTabs() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return (
    <div className="gpdl-card p-3">
      <div className="gpdl-tabs">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`gpdl-tab ${pathname.startsWith(it.href) ? 'is-active' : ''}`}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
