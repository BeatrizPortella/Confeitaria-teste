import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, List, ShoppingBag, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const { logout } = useAuth()!;
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Options', path: '/options', icon: List },
        { name: 'Orders', path: '/orders', icon: ShoppingBag },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Confeitaria Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
