'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, ShoppingBag, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Opções', href: '/admin/options', icon: List },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow-md md:hidden"
            >
                {isMobileOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>

            {/* Overlay for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r bg-white shadow-sm transition-all duration-300 ease-in-out md:static',
                    // Mobile state (hidden vs visible)
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                    // Desktop state (collapsed vs expanded)
                    isCollapsed ? 'md:w-20' : 'md:w-64',
                    'w-64' // Always w-64 on mobile when open
                )}
            >
                {/* Header */}
                <div className={clsx("flex h-16 items-center border-b px-4", isCollapsed ? 'justify-center' : 'justify-between')}>
                    {!isCollapsed && <h1 className="text-xl font-bold text-pink-600">Confeitaria</h1>}

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden rounded-full p-1 hover:bg-gray-100 md:block"
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5 text-gray-500" /> : <ChevronLeft className="h-5 w-5 text-gray-500" />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)} // Close on navigate (mobile)
                                className={clsx(
                                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-pink-50 text-pink-600'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                    isCollapsed && 'justify-center'
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className={clsx('h-5 w-5 flex-shrink-0', isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-gray-500', !isCollapsed && 'mr-3')} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="border-t p-4">
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50",
                            isCollapsed && 'justify-center'
                        )}
                        title={isCollapsed ? "Sair" : undefined}
                    >
                        <LogOut className={clsx("h-5 w-5", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
