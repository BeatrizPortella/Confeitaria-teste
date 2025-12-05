import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const { user } = useAuth()!;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [user.token]);

    if (!data) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders (30d)</h3>
                    <p className="text-3xl font-bold mt-2">{data.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Revenue (30d)</h3>
                    <p className="text-3xl font-bold mt-2">R$ {Number(data.revenue).toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Avg Ticket</h3>
                    <p className="text-3xl font-bold mt-2">R$ {Number(data.avgTicket).toFixed(2)}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Orders per Day</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.ordersPerDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                <YAxis />
                                <Tooltip labelFormatter={(str) => new Date(str).toLocaleDateString()} />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Top Fillings</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topFillings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="qty" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
