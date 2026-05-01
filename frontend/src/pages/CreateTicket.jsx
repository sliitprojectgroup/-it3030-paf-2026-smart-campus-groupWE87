import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadTicketAttachment, getResources } from '../services/api';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CreateTicket() {
    const [formData, setFormData] = useState({
        resourceId: '',
        category: 'OTHER',
        description: '',
        priority: 'MEDIUM',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        userId: localStorage.getItem('userId') || '1'
    });

    const [attachments, setAttachments] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getResources().then(data => {
            setResources(data);
        }).catch(err => {
            console.error('Failed to load resources:', err);
        });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (attachments.length + files.length > 3) {
            toast.error('Maximum 3 attachments allowed');
            return;
        }

        // Validate files are images
        for (let file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error('Only image files are allowed');
                return;
            }
        }

        const newAttachments = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const removeAttachment = (index) => {
        const updated = attachments.filter((_, i) => i !== index);
        setAttachments(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.resourceId) {
                toast.error('Please select a resource');
                setLoading(false);
                return;
            }

            // Create the ticket
            const ticketResponse = await createTicket({
                resourceId: Number(formData.resourceId),
                category: formData.category,
                description: formData.description,
                priority: formData.priority,
                contactName: formData.contactName,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
                userId: Number(formData.userId)
            });

            toast.success('Ticket created successfully!');

            // Upload attachments if any
            if (attachments.length > 0 && ticketResponse && ticketResponse.id) {
                setUploading(true);
                for (const attachment of attachments) {
                    try {
                        await uploadTicketAttachment(ticketResponse.id, attachment.file);
                    } catch (err) {
                        console.error('Failed to upload attachment:', err);
                        toast.error(`Failed to upload ${attachment.name}`);
                    }
                }
                setUploading(false);
                toast.success('Attachments uploaded successfully!');
            }

            navigate('/tickets');
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const priorityColors = {
        'LOW': 'bg-green-100 text-green-800',
        'MEDIUM': 'bg-yellow-100 text-yellow-800',
        'HIGH': 'bg-orange-100 text-orange-800',
        'CRITICAL': 'bg-red-100 text-red-800'
    };

    return (
        <div className="p-6 md:p-12 max-w-3xl mx-auto mt-4 md:mt-0">
            <header className="mb-8">
                <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-primary mb-2">Report an Issue</h1>
                <p className="font-body text-on-surface-variant">Submit a maintenance or IT request with detailed information.</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-low p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                
                {/* Resource Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Resource <span className="text-red-500">*</span></label>
                    <select
                        name="resourceId"
                        required
                        value={formData.resourceId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                    >
                        <option value="">Select a resource...</option>
                        {resources.map(resource => (
                            <option key={resource.id} value={resource.id}>
                                {resource.name} ({resource.type})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                    >
                        <option value="ELECTRICAL">Electrical</option>
                        <option value="PLUMBING">Plumbing</option>
                        <option value="HVAC">HVAC/Cooling</option>
                        <option value="IT">IT/Technology</option>
                        <option value="FURNITURE">Furniture/Fixtures</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {/* Priority Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Priority</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
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
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm resize-y"
                        rows="4"
                        placeholder="Describe the issue in detail..."
                    ></textarea>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-on-surface">Contact Name</label>
                        <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-on-surface">Phone</label>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-on-surface">Email</label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm"
                            placeholder="your.email@example.com"
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-on-surface">Attachments (Up to 3 images as evidence)</label>
                    <div className="relative border-2 border-dashed border-outline-variant/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={attachments.length >= 3}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <svg className="w-8 h-8 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-sm font-medium text-on-surface">Click or drag images here</p>
                            <p className="text-xs text-on-surface-variant">PNG, JPG, GIF up to 10MB</p>
                            {attachments.length > 0 && <p className="text-xs text-primary">{attachments.length}/3 files selected</p>}
                        </div>
                    </div>
                </div>

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-2 text-on-surface">Selected Attachments</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {attachments.map((att, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={att.preview}
                                        alt={att.name}
                                        className="w-full h-24 object-cover rounded-lg border border-outline-variant/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <p className="text-xs text-on-surface-variant mt-1 truncate">{att.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Actions */}
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
                        disabled={loading || uploading}
                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary transition-colors text-sm disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? 'Creating...' : uploading ? 'Uploading...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
