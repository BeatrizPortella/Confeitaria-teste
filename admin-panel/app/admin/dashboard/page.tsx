'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

// Mock data for initial visualization (will be replaced by API data)
const data = [
    { name: 'Seg', vendas: 4000, pedidos: 24 },
    { name: 'Ter', vendas: 3000, pedidos: 18 },
    { name: 'Qua', vendas: 2000, pedidos: 12 },
    { name: 'Qui', vendas: 2780, pedidos: 15 },
    { name: 'Sex', vendas: 1890, pedidos: 10 },
    { name: 'Sáb', vendas: 2390, pedidos: 20 },
    { name: 'Dom', vendas: 3490, pedidos: 22 },
];

const stats = [
    { name: 'Faturamento Total', value: 'R$ 12.450,00', icon: DollarSign, change: '+12%', changeType: 'positive' },
    { name: 'Pedidos Hoje', value: '24', icon: ShoppingBag, change: '+4%', changeType: 'positive' },
    { name: 'Ticket Médio', value: 'R$ 145,00', icon: TrendingUp, change: '-2%', changeType: 'negative' },
    { name: 'Novos Clientes', value: '12', icon: Users, change: '+8%', changeType: 'positive' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-500">Última atualização: Hoje, 14:30</div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className="rounded-full bg-pink-50 p-3 text-pink-600">
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                                {stat.change}
                            </span>
                            <span className="ml-2 text-gray-500">vs. mês passado</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Faturamento Semanal</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    formatter={(value) => [`R$ ${value}`, 'Vendas']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="vendas" fill="#db2777" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Chart */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Pedidos por Dia</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="pedidos" stroke="#db2777" strokeWidth={3} dot={{ r: 4, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
