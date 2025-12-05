'use client';

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

type Order = {
    id: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
    created_at: string;
    items: {
        size: string;
        dough: string;
        filling1: string;
        filling2: string;
        coverage: string;
        decoration: string;
        decorationExtras: string[];
        observations: string;
    };
};

const STATUS_MAP = {
    NEW: { label: 'Novo', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    IN_PROGRESS: { label: 'Em Produção', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    READY: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    DELIVERED: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: Truck },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders?status=${filterStatus}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) throw new Error('Falha ao atualizar');

            toast.success('Status atualizado!');
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciar Pedidos</h1>
                <div className="flex space-x-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border-gray-300 text-sm focus:border-pink-500 focus:ring-pink-500"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="NEW">Novos</option>
                        <option value="IN_PROGRESS">Em Produção</option>
                        <option value="READY">Prontos</option>
                        <option value="DELIVERED">Entregues</option>
                        <option value="CANCELLED">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando pedidos...</div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {orders.map((order) => {
                                const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.NEW;
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR')} <br />
                                            <span className="text-xs">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                            <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            R$ {Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig.color)}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-pink-600 hover:text-pink-900"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Pedido #{selectedOrder.id.slice(0, 8)}
                            </h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Fechar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                                    <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Status Atual</h3>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                            className="rounded-md border-gray-300 text-sm shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                        >
                                            {Object.entries(STATUS_MAP).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-gray-50 p-4">
                                <h3 className="mb-3 font-semibold text-gray-900">Detalhes do Bolo</h3>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Tamanho</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.items.size}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Massa</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.items.dough}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Recheio 1</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.items.filling1}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Recheio 2</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.items.filling2}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Cobertura</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.items.coverage}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Decoração</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.items.decoration || '-'}</dd>
                                    </div>
                                    {selectedOrder.items.decorationExtras && selectedOrder.items.decorationExtras.length > 0 && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">Adicionais</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <ul className="list-inside list-disc">
                                                    {selectedOrder.items.decorationExtras.map((extra, idx) => (
                                                        <li key={idx}>{extra}</li>
                                                    ))}
                                                </ul>
                                            </dd>
                                        </div>
                                    )}
                                    {selectedOrder.items.observations && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">Observações</dt>
                                            <dd className="mt-1 rounded-md bg-white p-2 text-sm text-gray-900 border">
                                                {selectedOrder.items.observations}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            <div className="mt-6 flex justify-end border-t pt-4">
                                <div className="text-right">
                                    <span className="block text-sm font-medium text-gray-500">Valor Total</span>
                                    <span className="text-2xl font-bold text-pink-600">R$ {Number(selectedOrder.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
