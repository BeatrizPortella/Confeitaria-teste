'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Opções', href: '/admin/options', icon: List },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r bg-white shadow-sm">
            <div className="flex h-16 items-center justify-center border-b px-6">
                <h1 className="text-xl font-bold text-pink-600">Confeitaria Admin</h1>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-pink-50 text-pink-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <Icon className={clsx('mr-3 h-5 w-5 flex-shrink-0', isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-gray-500')} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sair
                </button>
            </div>
        </aside>
    );
}
