import { Head } from '@inertiajs/react';
import { useState, ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

interface Props {
    children: ReactNode;
    header?: ReactNode;
}

export default function CustomAdminLayout({ children, header }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#0f1729]">
            <Head title="Admin" />

            {/* Sidebar Component */}
            <Sidebar isOpen={sidebarOpen} />

            {/* Main Content Area */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
                {/* Topbar Component */}
                <Topbar 
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                    header={header}
                />

                {/* Page Content */}
                <main className="bg-[#0f1729] min-h-[calc(100vh-73px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}