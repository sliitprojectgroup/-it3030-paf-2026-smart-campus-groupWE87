import { useState, useEffect } from 'react';
import { getResources, createResource, updateResource, deleteResource } from '../services/api';

export default function AdminResourceOps() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('ADD'); // 'ADD' or 'EDIT'
    const [formData, setFormData] = useState({ name: '', type: '', capacity: 1, status: 'ACTIVE' });

    useEffect(() => {
        loadResources();
    }, []);

    async function loadResources() {
        try {
            setLoading(true);
            const data = await getResources();
            setResources(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load resources.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, resource = null) => {
        setModalMode(mode);
        if (mode === 'EDIT' && resource) {
            setFormData({
                id: resource.id,
                name: resource.name,
                type: resource.type,
                capacity: resource.capacity,
                status: resource.status
            });
        } else {
            setFormData({ name: '', type: '', capacity: 1, status: 'ACTIVE' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ name: '', type: '', capacity: 1, status: 'ACTIVE' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.capacity <= 0) {
            alert('Capacity must be greater than 0');
            return;
        }

        try {
            if (modalMode === 'ADD') {
                await createResource(formData);
            } else if (modalMode === 'EDIT') {
                await updateResource(formData.id, formData);
            }
            setShowModal(false);
            loadResources();
        } catch (err) {
            alert('Operation failed. ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await deleteResource(id);
            setResources(resources.filter(r => r.id !== id));
        } catch (err) {
            alert('Delete failed. ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
            <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h2 className="font-headline text-3xl font-bold text-primary mb-2">Resource Management</h2>
                    <p className="font-body text-on-surface-variant">Add, edit, or remove campus resources.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal('ADD')}
                    className="px-6 py-3 bg-primary text-on-primary rounded-xl font-body font-medium hover:bg-primary-container transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Resource
                </button>
            </header>

            {error && (
                <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-body text-sm font-medium">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <div key={resource.id} className="bg-surface-container-lowest rounded-xl p-6 ghost-border flex flex-col group hover:shadow-md transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-headline text-lg font-bold text-primary">{resource.name}</h3>
                                    <p className="text-sm text-on-surface-variant capitalize">{resource.type}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full font-label text-xs font-semibold
                                    ${resource.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary' : 'bg-error-container text-on-error-container'}`}>
                                    {resource.status}
                                </span>
                            </div>
                            
                            <div className="mb-6 flex gap-4 text-sm font-medium text-on-surface-variant">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span> {resource.capacity}</span>
                            </div>

                            <div className="mt-auto flex gap-2 w-full pt-4 border-t border-outline-variant/20">
                                <button 
                                    onClick={() => handleOpenModal('EDIT', resource)}
                                    className="flex-1 px-4 py-2 bg-surface flex items-center justify-center gap-1 text-primary rounded-lg font-body text-sm font-medium hover:bg-surface-container transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(resource.id)}
                                    className="flex-1 px-4 py-2 bg-error/10 flex items-center justify-center gap-1 text-error rounded-lg font-body text-sm font-medium hover:bg-error/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && (
                        <div className="col-span-full py-8 text-center text-on-surface-variant">No resources found.</div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <h3 className="font-headline text-xl font-bold text-primary mb-6">
                            {modalMode === 'ADD' ? 'Add New Resource' : 'Edit Resource'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Name</label>
                                <input 
                                    type="text" required name="name" 
                                    value={formData.name} onChange={handleInputChange}
                                    className="w-full bg-surface-container border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Type</label>
                                <input 
                                    type="text" required name="type" 
                                    value={formData.type} onChange={handleInputChange} placeholder="e.g. Room, Lab, Equipment"
                                    className="w-full bg-surface-container border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Capacity</label>
                                    <input 
                                        type="number" required min="1" name="capacity" 
                                        value={formData.capacity} onChange={handleInputChange}
                                        className="w-full bg-surface-container border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
                                    <select 
                                        name="status" value={formData.status} onChange={handleInputChange}
                                        className="w-full bg-surface-container border-none rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-surface text-on-surface rounded-xl font-body text-sm font-medium hover:bg-surface-container transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-xl font-body text-sm font-medium hover:bg-primary-container transition-colors">
                                    {modalMode === 'ADD' ? 'Save' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
