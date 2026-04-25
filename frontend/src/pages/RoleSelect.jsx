import { useNavigate } from 'react-router-dom';
import { setRole } from '../utils/auth';

export default function RoleSelect() {
    const navigate = useNavigate();

    const handleSelectRole = (role) => {
        setRole(role);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
            <div className="bg-surface-container-low p-8 rounded-3xl shadow-lg border border-outline-variant/20 max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[32px]">account_circle</span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Welcome</h1>
                <p className="font-body text-on-surface-variant mb-8 text-sm">Please select your role to continue</p>
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => handleSelectRole('USER')}
                        className="w-full py-4 px-6 rounded-2xl bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors font-body font-semibold text-[15px] flex items-center justify-center gap-3 border border-outline-variant/10"
                    >
                        <span className="material-symbols-outlined text-[20px]">person</span>
                        Continue as User
                    </button>
                    <button 
                        onClick={() => handleSelectRole('ADMIN')}
                        className="w-full py-4 px-6 rounded-2xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-body font-semibold text-[15px] flex items-center justify-center gap-3 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                        Continue as Admin
                    </button>
                </div>
            </div>
        </div>
    );
}
