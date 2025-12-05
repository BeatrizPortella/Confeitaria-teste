import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, X } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const { user } = useAuth()!;
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/admin/orders', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setOrders(res.data.orders);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user.token]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await axios.put(`/api/admin/orders/${id}`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Orders</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id.slice(0, 8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order.customer_name}<br />
                                    <span className="text-gray-400 text-xs">{order.customer_phone}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {Number(order.total).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className="text-xs border rounded p-1"
                                    >
                                        <option value="NEW">NEW</option>
                                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                                        <option value="READY">READY</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-900"><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Order Details</h3>
                            <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Customer</p>
                                    <p>{selectedOrder.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p>{selectedOrder.customer_phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p>{selectedOrder.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total</p>
                                    <p>R$ {Number(selectedOrder.total).toFixed(2)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
                                <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                                    <pre>{JSON.stringify(selectedOrder.items, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
