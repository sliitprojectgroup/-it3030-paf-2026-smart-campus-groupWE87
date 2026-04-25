import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUser } from '../utils/auth';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            const user = response.data;
            
            // The instructions asked to set userId, role, and name.
            // Using our auth.js setUser which sets the whole user object.
            setUser(user);
            
            // Also setting individual items just in case other parts of code expect it
            localStorage.setItem('userId', user.id);
            localStorage.setItem('role', user.role);
            localStorage.setItem('name', user.name);
            
            navigate('/');
        } catch (err) {
            setError("Invalid credentials");
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
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Welcome Back</h1>
                <p className="font-body text-on-surface-variant mb-8 text-sm">Please log in to your account</p>
                
                {error && (
                    <div className="bg-error-container text-on-error-container p-3 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                    <div>
                        <label className="block font-label text-sm font-medium text-on-surface mb-2">Email Address</label>
                        <input 
                            required 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" 
                            placeholder="name@sliit.lk" 
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-label text-sm font-medium text-on-surface mb-2">Password</label>
                        <input 
                            required 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" 
                            placeholder="••••••" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-body font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 mt-2"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
