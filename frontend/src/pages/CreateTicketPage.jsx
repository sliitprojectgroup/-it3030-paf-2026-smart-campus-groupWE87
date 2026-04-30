import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadTicketAttachments, getResources } from '../services/api';
import { getUser } from '../utils/auth';
import { useEffect } from 'react';

export default function CreateTicketPage() {
    const navigate = useNavigate();
    const user = getUser();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [formData, setFormData] = useState({
        resourceId: '',
        category: 'MAINTENANCE',
        description: '',
        priority: 'MEDIUM',
        preferredContact: '',
    });

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [filePreview, setFilePreview] = useState([]);

    useEffect(() => {
        const loadResources = async () => {
            try {
                const data = await getResources();
                setResources(data || []);
            } catch (err) {
                console.error('Failed to load resources:', err);
            }
        };
        loadResources();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + uploadedFiles.length > 3) {
            setError('Maximum 3 files allowed');
            return;
        }

        // Check file sizes
        const hasLargeFile = files.some(file => file.size > 5 * 1024 * 1024);
        if (hasLargeFile) {
            setError('File size must not exceed 5MB');
            return;
        }

        // Check file types
        const hasInvalidType = files.some(file => !file.type.startsWith('image/'));
        if (hasInvalidType) {
            setError('Only image files are allowed');
            return;
        }

        setUploadedFiles(prev => [...prev, ...files]);
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setFilePreview(prev => [...prev, ...previews]);
        setError(null);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreview(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create ticket
            const ticketData = {
                resourceId: parseInt(formData.resourceId),
                userId: user?.id,
                category: formData.category,
                description: formData.description,
                priority: formData.priority,
                preferredContact: formData.preferredContact,
                status: 'OPEN'
            };

            const newTicket = await createTicket(ticketData);
            
            // Upload attachments if any
            if (uploadedFiles.length > 0) {
                await uploadTicketAttachments(newTicket.id, uploadedFiles);
            }

            setSuccessMessage('Ticket created successfully!');
            setTimeout(() => {
                navigate(`/ticket/${newTicket.id}`);
            }, 1500);

        } catch (err) {
            console.error('Failed to create ticket:', err);
            setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 px-6 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
                    <p className="text-gray-600 mt-1">Report a maintenance issue or incident</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                    {/* Resource Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Resource <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="resourceId"
                            value={formData.resourceId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">-- Choose a resource --</option>
                            {resources.map(resource => (
                                <option key={resource.id} value={resource.id}>
                                    {resource.name} ({resource.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="REPAIR">Repair</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="INCIDENT">Incident</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="5"
                            placeholder="Describe the issue in detail..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Priority Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Priority <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['LOW', 'MEDIUM', 'HIGH'].map(priority => (
                                <label key={priority} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={priority}
                                        checked={formData.priority === priority}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-700">{priority}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Contact */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preferred Contact Method
                        </label>
                        <input
                            type="text"
                            name="preferredContact"
                            value={formData.preferredContact}
                            onChange={handleInputChange}
                            placeholder="Email, phone, or in-person"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Attachments (max 3 images, 5MB each)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-input"
                            />
                            <label htmlFor="file-input" className="cursor-pointer">
                                <p className="text-gray-600">Drag and drop or click to select images</p>
                                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </label>
                        </div>

                        {/* File Preview */}
                        {filePreview.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {filePreview.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
                        >
                            {loading ? 'Creating...' : 'Create Ticket'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
