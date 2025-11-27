import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { router } from '@inertiajs/react';
import { LogOut, Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface UserMenuContentProps {
  user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    cleanup();
    setLoading(true);

    router.post(
      logout(),
      {},
      {
        preserveScroll: false,
        preserveState: false,
        replace: true, // 🔥 evita criar histórico extra (previne flash 404)
        onFinish: () => {
          setLoading(false);
          window.location.href = '/login';
        },
      }
    );
  };

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
  <a
    href={String(edit())}
    onClick={cleanup}
    className="flex items-center gap-2 text-sm"
  >
    <Settings className="h-4 w-4" />
    Configurações
  </a>
</DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-2 text-sm text-left disabled:opacity-60"
          data-test="logout-button"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Sair
            </>
          )}
        </button>
      </DropdownMenuItem>
    </>
  );
}
