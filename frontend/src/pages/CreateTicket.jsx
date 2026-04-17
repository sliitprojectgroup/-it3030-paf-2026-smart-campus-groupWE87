import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';

export default function CreateTicket() {
    const [resourceId, setResourceId] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket({ resourceId: Number(resourceId), description, status: 'OPEN' });
            alert('Ticket created successfully');
            navigate('/tickets');
        } catch (err) {
            alert('Failed to create ticket. Please verify inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto mt-4 md:mt-10">
            <header className="mb-8">
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Report an Issue</h1>
                <p className="font-body text-on-surface-variant">Submit a maintenance or IT request.</p>
            </header>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-low p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Resource ID</label>
                    <input 
                        type="number" 
                        required 
                        value={resourceId} 
                        onChange={e => setResourceId(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm" 
                        placeholder="e.g. 1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Description details</label>
                    <textarea 
                        required 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm resize-y" 
                        rows="5"
                        placeholder="Describe the issue..."
                    ></textarea>
                </div>
                <div className="flex gap-4 pt-4 mt-2 border-t border-outline-variant/10">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-surface-container hover:bg-surface-container-highest transition-colors text-on-surface text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary transition-colors text-sm disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
