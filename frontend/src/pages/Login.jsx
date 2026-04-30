import { useNavigate } from 'react-router-dom';
import { setDemoUser } from '../utils/auth';

export default function Login() {
    const navigate = useNavigate();

    const continueAs = (role) => {
        setDemoUser(role);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
            <div className="bg-surface-container-low p-8 rounded-3xl shadow-[0px_20px_40px_rgba(0,27,68,0.06)] border border-outline-variant/10 max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[32px]">login</span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Smart Campus</h1>
                <p className="font-body text-on-surface-variant mb-8 text-sm">Continue without email or password.</p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => continueAs('USER')}
                        className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-body font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Continue as User
                    </button>
                    <button
                        type="button"
                        onClick={() => continueAs('ADMIN')}
                        className="w-full py-4 px-6 rounded-xl bg-surface-container-highest text-primary hover:bg-surface-container transition-colors font-body font-semibold text-[15px] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        Continue as Admin
                    </button>
                </div>
            </div>
        </div>
    );
}
