import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setUser } from '../utils/auth';
import { loginUser } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await loginUser(credentials);
            setUser(user);
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
            <div className="bg-surface-container-low p-8 rounded-3xl shadow-[0px_20px_40px_rgba(0,27,68,0.06)] border border-outline-variant/10 max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[32px]">login</span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Smart Campus</h1>
                <p className="font-body text-on-surface-variant mb-6 text-sm">Sign in to your account</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
                    <div>
                        <label className="font-label text-sm font-semibold text-on-surface-variant mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                            <input 
                                type="email"
                                name="email"
                                placeholder="name@sliit.lk"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant/50 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body text-[15px]" 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="font-label text-sm font-semibold text-on-surface-variant mb-1.5 block">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant/50 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body text-[15px]" 
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-4 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-70 transition-colors font-body font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        )}
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
