'use client';

import { supabaseClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error('Falha no login. Verifique suas credenciais.');
            setLoading(false);
        } else {
            toast.success('Login realizado com sucesso!');
            router.push('/admin/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-50 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl">
                <div className="bg-white p-8 md:p-10">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h2>
                        <p className="mt-2 text-sm text-gray-500">Acesse o painel administrativo da Confeitaria</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                                    placeholder="admin@exemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg bg-pink-600 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 px-8 py-4 text-center">
                    <p className="text-xs text-gray-500">
                        &copy; 2025 Confeitaria Renata Magela. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
