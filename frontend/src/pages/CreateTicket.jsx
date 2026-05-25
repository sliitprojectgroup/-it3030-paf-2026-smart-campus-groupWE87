import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadAttachment, getResources } from '../services/api';

export default function CreateTicket() {
    const [resources, setResources] = useState([]);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [resourceId, setResourceId] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [preferredContact, setPreferredContact] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await getResources();
                setResources(data);
                setLoadingResources(false);
            } catch (err) {
                console.error('Failed to fetch resources:', err);
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validate number of files
        if (files.length + attachments.length > 3) {
            setError('Maximum 3 attachments allowed');
            return;
        }

        // Validate file types and size
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError(`File ${file.name} has invalid type. Only JPEG, PNG, GIF, WebP allowed.`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setError(`File ${file.name} exceeds 5MB limit.`);
                return false;
            }
            return true;
        });

        setAttachments([...attachments, ...validFiles]);
        setError('');
    };

    const removeAttachment = (index) => {
        const newAttachments = attachments.filter((_, i) => i !== index);
        setAttachments(newAttachments);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Validate required fields
            if (!category || !description || !resourceId || !preferredContact) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Create ticket
            const ticketData = {
                category,
                description,
                resourceId: Number(resourceId),
                priority,
                preferredContact,
                createdBy: Number(currentUserId)
            };

            const newTicket = await createTicket(ticketData);
            setSuccessMessage(`Ticket #${newTicket.id} created successfully`);

            // Upload attachments if any
            if (attachments.length > 0) {
                for (const file of attachments) {
                    try {
                        await uploadAttachment(newTicket.id, file);
                    } catch (uploadErr) {
                        console.error('Failed to upload file:', uploadErr);
                    }
                }
            }

            // Reset form
            setCategory('');
            setDescription('');
            setResourceId('');
            setPriority('MEDIUM');
            setPreferredContact('');
            setAttachments([]);

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate(`/tickets/${newTicket.id}`);
            }, 2000);
        } catch (err) {
            console.error('Failed to create ticket:', err);
            setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto mt-4 md:mt-10">
            <header className="mb-8">
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Report an Issue</h1>
                <p className="font-body text-on-surface-variant">Submit a maintenance or IT request with details and attachments.</p>
            </header>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm text-green-700">{successMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-low p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                
                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Category <span className="text-red-500">*</span></label>
                    <select 
                        required 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                    >
                        <option value="">Select a category</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="IT_SUPPORT">IT Support</option>
                        <option value="FACILITIES">Facilities</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* Resource */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Resource/Location <span className="text-red-500">*</span></label>
                    {loadingResources ? (
                        <div className="w-full px-4 py-3 rounded-xl bg-surface border-none text-on-surface-variant text-sm">
                            Loading resources...
                        </div>
                    ) : (
                        <select 
                            required 
                            value={resourceId} 
                            onChange={e => setResourceId(e.target.value)} 
                            className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                        >
                            <option value="">Select a resource</option>
                            {resources.map(resource => (
                                <option key={resource.id} value={resource.id}>
                                    {resource.name} ({resource.location})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Priority <span className="text-red-500">*</span></label>
                    <select 
                        required 
                        value={priority} 
                        onChange={e => setPriority(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Description <span className="text-red-500">*</span></label>
                    <textarea 
                        required 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm resize-y" 
                        rows="5"
                        placeholder="Describe the issue in detail..."
                        minLength="10"
                        maxLength="500"
                    ></textarea>
                    <p className="text-xs text-on-surface-variant mt-1">{description.length}/500 characters</p>
                </div>

                {/* Preferred Contact */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Preferred Contact <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        required 
                        value={preferredContact} 
                        onChange={e => setPreferredContact(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm" 
                        placeholder="Email or phone number"
                    />
                </div>

                {/* Attachments */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Attachments (up to 3 images)</label>
                    <div className="w-full px-4 py-6 rounded-xl bg-surface border-2 border-dashed border-outline-variant/50 text-center cursor-pointer hover:border-primary transition-colors">
                        <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-input"
                        />
                        <label htmlFor="file-input" className="cursor-pointer">
                            <p className="text-sm font-medium text-on-surface">Click to upload or drag and drop</p>
                            <p className="text-xs text-on-surface-variant mt-1">PNG, JPG, GIF, WebP (max 5MB each)</p>
                        </label>
                    </div>

                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-on-surface mb-2">Attached files ({attachments.length}/3):</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {attachments.map((file, index) => (
                                    <div key={index} className="relative">
                                        <div className="aspect-square rounded-lg bg-surface-container overflow-hidden">
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                        <p className="text-xs text-on-surface-variant mt-1 truncate">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
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
