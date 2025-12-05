import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function Options() {
    const [options, setOptions] = useState<any[]>([]);
    const { user } = useAuth()!;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<any>(null);
    const [formData, setFormData] = useState({
        type: 'RECHEIO',
        name: '',
        slug: '',
        price: 0,
        active: true,
        order: 0,
    });

    const fetchOptions = async () => {
        try {
            const res = await axios.get('/api/admin/options', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setOptions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, [user.token]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`/api/admin/options/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchOptions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingOption) {
                await axios.put(`/api/admin/options/${editingOption.id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            } else {
                await axios.post('/api/admin/options', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }
            setIsModalOpen(false);
            setEditingOption(null);
            setFormData({ type: 'RECHEIO', name: '', slug: '', price: 0, active: true, order: 0 });
            fetchOptions();
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (opt: any) => {
        setEditingOption(opt);
        setFormData({
            type: opt.type,
            name: opt.name,
            slug: opt.slug,
            price: Number(opt.price),
            active: opt.active,
            order: opt.order,
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Options Management</h2>
                <button
                    onClick={() => {
                        setEditingOption(null);
                        setFormData({ type: 'RECHEIO', name: '', slug: '', price: 0, active: true, order: 0 });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Plus size={18} />
                    <span>New Option</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {options.map((opt) => (
                            <tr key={opt.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{opt.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{opt.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {Number(opt.price).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${opt.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {opt.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => openEdit(opt)} className="text-indigo-600 hover:text-indigo-900"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(opt.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingOption ? 'Edit Option' : 'New Option'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="RECHEIO">RECHEIO</option>
                                    <option value="MASSA">MASSA</option>
                                    <option value="COBERTURA">COBERTURA</option>
                                    <option value="TAMANHO">TAMANHO</option>
                                    <option value="ADICIONAL">ADICIONAL</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full border rounded p-2"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Order</label>
                                <input
                                    type="number"
                                    className="w-full border rounded p-2"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <label className="text-sm font-medium">Active</label>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
