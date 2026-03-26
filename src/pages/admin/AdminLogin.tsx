import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { login, user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [localLoading, setLocalLoading] = useState(false);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (!isLoading && user && user.role === 'admin') {
            navigate('/admin');
        }
    }, [user, isLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalLoading(true);
        try {
            await login({ email: formData.email, password: formData.password });
            // AuthContext handles setting user state
            // useEffect above handles redirection
        } catch (error) {
            console.error('Admin login failed:', error);
        } finally {
            setLocalLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-emerald-500/30">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo/Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-bold text-white mb-2">VC Admin Access</h1>
                        <p className="text-gray-400 text-sm">Secure authorization required to proceed</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                                Administrator Identity
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-600"
                                    placeholder="Enter admin email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                                Security Credentials
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={localLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                            >
                                {localLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Authorize Session
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-800">
                        <a href="/" className="text-gray-500 hover:text-gray-300 text-xs transition-colors flex items-center justify-center gap-1">
                            Return to storefront
                        </a>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
                        Authenticated Environment Layer v2.1
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
