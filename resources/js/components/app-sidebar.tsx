import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { navigationItems, type PermissionRequirement } from '@/navigation/menu';
import { canAccessPermission, type PermissionMap } from '@/navigation/permissions';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { permissions } = usePage().props as { permissions?: PermissionMap };

    const canAccess = (requirement?: PermissionRequirement) =>
        canAccessPermission(permissions, requirement);

    const mainNavItems: NavItem[] = navigationItems
        .filter((item) => (item.section ?? 'main') === 'main')
        .flatMap((item) => {
            if (!canAccess(item.permission)) {
                return [] as NavItem[];
            }

            if (item.children?.length) {
                return item.children
                    .filter((child) => child.href && canAccess(child.permission))
                    .map((child) => ({
                        title: child.label,
                        href: child.href!,
                        icon: child.icon,
                    } satisfies NavItem));
            }

            if (!item.href) {
                return [] as NavItem[];
            }

            return [
                {
                    title: item.label,
                    href: item.href,
                    icon: item.icon,
                } satisfies NavItem,
            ];
        });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
