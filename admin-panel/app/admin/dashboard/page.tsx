'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';



export default function DashboardPage() {
    const [data, setData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ revenue: 0, ordersToday: 0, averageTicket: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard');
                const json = await res.json();
                if (json.metrics) setMetrics(json.metrics);
                if (json.chart) setData(json.chart);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { name: 'Faturamento Total (Confirmado)', value: `R$ ${metrics.revenue.toFixed(2)}`, icon: DollarSign, change: 'Confirmado', changeType: 'positive' },
        { name: 'Pedidos Hoje', value: metrics.ordersToday.toString(), icon: ShoppingBag, change: 'Volume', changeType: 'neutral' },
        { name: 'Ticket Médio', value: `R$ ${metrics.averageTicket.toFixed(2)}`, icon: TrendingUp, change: 'Média', changeType: 'positive' },
        // { name: 'Novos Clientes', value: '12', icon: Users, change: '+8%', changeType: 'positive' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-500">Dados em tempo real</div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            <span className="text-gray-500">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue Chart */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Faturamento e Pedidos (Semanal)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" orientation="left" stroke="#db2777" />
                                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                                <Tooltip
                                    formatter={(value, name) => [name === 'vendas' ? `R$ ${value}` : value, name === 'vendas' ? 'Faturamento' : 'Pedidos']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar yAxisId="left" dataKey="vendas" fill="#db2777" radius={[4, 4, 0, 0]} name="vendas" />
                                <Bar yAxisId="right" dataKey="pedidos" fill="#ddd" radius={[4, 4, 0, 0]} name="pedidos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
