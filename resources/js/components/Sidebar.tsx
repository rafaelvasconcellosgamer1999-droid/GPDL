import { Link, usePage } from '@inertiajs/react';

interface PageProps {
    auth: {
        user: {
            name: string;
            nome?: string;
            email: string;
        };
    };
}

interface Props {
    isOpen: boolean;
}

export default function Sidebar({ isOpen }: Props) {
    const { auth, url } = usePage<PageProps & { url: string }>();
    const userName = auth.user.nome || auth.user.name || 'Usuário';
    const userInitial = userName.charAt(0).toUpperCase();

    const isActive = (path: string) => {
        return url.startsWith(path);
    };

    const menuItems = [
        {
            section: 'Principal',
            items: [
                { name: 'Início', href: '/dashboard', icon: 'home' },
                { name: 'Processos', href: '/processos', icon: 'document', hasSubmenu: true },
                { name: 'Agenda', href: '/agenda', icon: 'calendar' },
                { name: 'Relatórios', href: '/relatorios', icon: 'chart' },
                { name: 'Administração', href: '/admin', icon: 'settings' },
                { name: 'Squads', href: '/squads', icon: 'users' },
            ]
        },
        {
            section: 'Monitoramento',
            items: [
                { name: 'Logs do Sistema', href: '/logs', icon: 'document' },
                { name: 'Auditoria', href: '/auditoria', icon: 'eye' },
            ]
        }
    ];

    const getIcon = (iconName: string) => {
        const icons: Record<string, JSX.Element> = {
            home: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            document: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            calendar: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            chart: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            settings: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            users: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            eye: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
        };
        return icons[iconName] || icons.document;
    };

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } w-64 bg-[#1a2332] border-r border-[#2d3748]`}
        >
            <div className="h-full flex flex-col overflow-y-auto">
                {/* Logo/Header */}
                <div className="p-6 border-b border-[#2d3748]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-sm">GERENCIADOR</h2>
                            <p className="text-gray-400 text-xs">Processos</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-3">
                        {new Date().toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                        })}
                    </p>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((section) => (
                        <div key={section.section} className="mb-4">
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                                {section.section}
                            </p>
                            {section.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition group ${
                                            active
                                                ? 'bg-[#2d3748] text-blue-400'
                                                : 'text-gray-300 hover:bg-[#2d3748]'
                                        }`}
                                    >
                                        <span className={active ? 'text-blue-400' : ''}>
                                            {getIcon(item.icon)}
                                        </span>
                                        <span className="text-sm">{item.name}</span>
                                        {item.hasSubmenu && (
                                            <svg className="w-4 h-4 ml-auto transform group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* User Info at Bottom */}
                <div className="p-4 border-t border-[#2d3748]">
                    <div className="bg-[#0f1729] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {userInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {userName}
                                </p>
                                <p className="text-gray-400 text-xs truncate">
                                    {auth.user.email}
                                </p>
                            </div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-gray-400 hover:text-white transition"
                                title="Sair"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}