'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

type Option = {
    id: string;
    type: string;
    name: string;
    slug: string;
    price: number;
    active: boolean;
    order: number;
};

const TABS = [
    { id: 'MASSA', label: 'Massas' },
    { id: 'RECHEIO', label: 'Recheios' },
    { id: 'COBERTURA', label: 'Coberturas' },
    { id: 'TAMANHO', label: 'Tamanhos' },
    { id: 'ADICIONAL', label: 'Adicionais' },
];

export default function OptionsPage() {
    const [activeTab, setActiveTab] = useState('MASSA');
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<Option | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        active: true,
    });

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/options?type=${activeTab}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOptions(data);
            }
        } catch (error) {
            toast.error('Erro ao carregar opções');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, [activeTab]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const slug = formData.name.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        const payload = {
            ...formData,
            type: activeTab,
            slug: editingOption ? editingOption.slug : slug, // Keep slug if editing, or generate new
            order: editingOption ? editingOption.order : options.length + 1,
        };

        try {
            const method = editingOption ? 'PUT' : 'POST';
            const body = editingOption ? { id: editingOption.id, ...payload } : payload;

            const res = await fetch('/api/options', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Falha ao salvar');

            toast.success(editingOption ? 'Opção atualizada!' : 'Opção criada!');
            setIsModalOpen(false);
            setEditingOption(null);
            setFormData({ name: '', price: 0, active: true });
            fetchOptions();
        } catch (error) {
            toast.error('Erro ao salvar opção');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;

        try {
            const res = await fetch(`/api/options?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Falha ao excluir');
            toast.success('Opção excluída');
            fetchOptions();
        } catch (error) {
            toast.error('Erro ao excluir');
        }
    };

    const openEdit = (opt: Option) => {
        setEditingOption(opt);
        setFormData({ name: opt.name, price: opt.price, active: opt.active });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingOption(null);
        setFormData({ name: '', price: 0, active: true });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciar Opções</h1>
                <button
                    onClick={openNew}
                    className="flex items-center rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Nova Opção
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                                activeTab === tab.id
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando...</div>
                ) : options.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Nenhuma opção encontrada.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {options.map((opt) => (
                                <tr key={opt.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{opt.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        R$ {Number(opt.price).toFixed(2)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={clsx(
                                                'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                                                opt.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            )}
                                        >
                                            {opt.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => openEdit(opt)} className="mr-4 text-indigo-600 hover:text-indigo-900">
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(opt.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">
                            {editingOption ? 'Editar Opção' : 'Nova Opção'}
                        </h2>
                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Preço Adicional (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                />
                            </div>
                            <div className="mb-6 flex items-center">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                />
                                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                                    Ativo (disponível no site)
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
