import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadTicketAttachment, getResources } from '../services/api';
import { getUser } from '../utils/auth';

export default function CreateTicket() {
    const navigate = useNavigate();
    const currentUser = getUser();
    
    const [formData, setFormData] = useState({
        resourceId: '',
        category: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        preferredContact: '',
    });

    const [resources, setResources] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resourcesLoading, setResourcesLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const categories = ['MAINTENANCE', 'IT', 'FACILITIES', 'CLEANING', 'SECURITY', 'OTHER'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const data = await getResources();
            setResources(data);
        } catch (err) {
            console.error('Failed to load resources:', err);
        } finally {
            setResourcesLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.resourceId) newErrors.resourceId = 'Resource is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.priority) newErrors.priority = 'Priority is required';
        if (!formData.preferredContact) newErrors.preferredContact = 'Contact information is required';
        if (attachments.length === 0) newErrors.attachments = 'At least one image is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (attachments.length + files.length > 3) {
            setErrors(prev => ({
                ...prev,
                attachments: 'Maximum 3 images allowed'
            }));
            return;
        }

        // Validate file types
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            
            if (!isImage) {
                setErrors(prev => ({
                    ...prev,
                    attachments: 'Only image files are allowed'
                }));
                return false;
            }
            
            if (!isValidSize) {
                setErrors(prev => ({
                    ...prev,
                    attachments: 'Each image must be less than 5MB'
                }));
                return false;
            }

            return true;
        });

        setAttachments(prev => [...prev, ...validFiles]);
        if (errors.attachments) {
            setErrors(prev => ({
                ...prev,
                attachments: ''
            }));
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Create ticket
            const ticketResponse = await createTicket({
                resourceId: Number(formData.resourceId),
                category: formData.category,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                preferredContact: formData.preferredContact,
                createdBy: currentUser.id,
                status: 'OPEN'
            });

            // Upload attachments
            for (const file of attachments) {
                try {
                    await uploadTicketAttachment(ticketResponse.id, file);
                } catch (err) {
                    console.error('Failed to upload file:', file.name, err);
                }
            }

            alert('Ticket created successfully');
            navigate(`/tickets/${ticketResponse.id}`);
        } catch (err) {
            console.error('Failed to create ticket:', err);
            setErrors({ submit: 'Failed to create ticket. Please try again.' });
            alert('Failed to create ticket. Please verify all inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto mt-4 md:mt-10">
            <header className="mb-8">
                <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Report an Issue</h1>
                <p className="font-body text-on-surface-variant">Submit a maintenance or IT request for a campus resource.</p>
            </header>

            {errors.submit && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-low p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                
                {/* Resource Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Resource *</label>
                    {resourcesLoading ? (
                        <div className="text-sm text-on-surface-variant">Loading resources...</div>
                    ) : (
                        <select 
                            name="resourceId"
                            required 
                            value={formData.resourceId} 
                            onChange={handleInputChange}
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
                    {errors.resourceId && <p className="text-red-500 text-xs mt-1">{errors.resourceId}</p>}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Category *</label>
                    <select 
                        name="category"
                        required 
                        value={formData.category} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Title *</label>
                    <input 
                        type="text" 
                        name="title"
                        required 
                        value={formData.title} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm" 
                        placeholder="e.g., Broken door lock"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Description *</label>
                    <textarea 
                        name="description"
                        required 
                        value={formData.description} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm resize-y" 
                        rows="5"
                        placeholder="Describe the issue in detail..."
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Priority *</label>
                    <select 
                        name="priority"
                        value={formData.priority} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                    >
                        {priorities.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
                </div>

                {/* Preferred Contact */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Preferred Contact *</label>
                    <input 
                        type="text" 
                        name="preferredContact"
                        required 
                        value={formData.preferredContact} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm" 
                        placeholder="e.g., email@example.com or +1234567890"
                    />
                    {errors.preferredContact && <p className="text-red-500 text-xs mt-1">{errors.preferredContact}</p>}
                </div>

                {/* Image Attachments */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Attach Images (Max 3) *</label>
                    <div className="mb-4">
                        <label className="block w-full p-4 border-2 border-dashed border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-container transition-colors text-center">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <p className="text-sm text-on-surface-variant">Click to upload or drag files here</p>
                            <p className="text-xs text-on-surface-variant mt-1">PNG, JPG, GIF up to 5MB each</p>
                        </label>
                    </div>
                    {errors.attachments && <p className="text-red-500 text-xs mb-2">{errors.attachments}</p>}
                    
                    {/* Preview uploaded files */}
                    {attachments.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {attachments.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={file.name}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                    <p className="text-xs text-on-surface-variant mt-1 truncate">{file.name}</p>
                                </div>
                            ))}
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
