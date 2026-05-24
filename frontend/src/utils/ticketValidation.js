/**
 * Ticket Validation Utility
 * Provides validation functions for ticket-related forms
 */

export const validateTicketForm = (formData) => {
    const errors = {};

    if (!formData.resourceId) {
        errors.resourceId = 'Resource is required';
    }

    if (!formData.category || formData.category.trim() === '') {
        errors.category = 'Category is required';
    }

    if (!formData.title || formData.title.trim() === '') {
        errors.title = 'Title is required';
    } else if (formData.title.length < 5) {
        errors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 200) {
        errors.title = 'Title must not exceed 200 characters';
    }

    if (!formData.description || formData.description.trim() === '') {
        errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
        errors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.length > 2000) {
        errors.description = 'Description must not exceed 2000 characters';
    }

    if (!formData.priority) {
        errors.priority = 'Priority is required';
    }

    if (!formData.preferredContact || formData.preferredContact.trim() === '') {
        errors.preferredContact = 'Preferred contact is required';
    } else if (!isValidContact(formData.preferredContact)) {
        errors.preferredContact = 'Please enter a valid email or phone number';
    }

    return errors;
};

export const validateFileAttachments = (files, maxFiles = 3, maxSizeMB = 5) => {
    const errors = [];

    if (!files || files.length === 0) {
        return ['At least one image is required'];
    }

    if (files.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} images allowed`);
    }

    for (const file of files) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            errors.push(`${file.name}: Only image files are allowed (JPG, PNG, GIF, WebP)`);
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB limit`);
        }
    }

    return errors;
};

export const validateImageFile = (file, maxSizeMB = 5) => {
    const errors = [];

    if (!file) {
        return errors;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        errors.push('Only JPG, PNG, GIF, and WebP images are allowed');
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
        errors.push(`File size exceeds ${maxSizeMB}MB limit`);
    }

    return errors;
};

export const isValidContact = (contact) => {
    if (!contact || contact.trim() === '') {
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(contact)) {
        return true;
    }

    // Phone validation (basic international format)
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/;
    if (phoneRegex.test(contact.replace(/\s/g, ''))) {
        return true;
    }

    return false;
};

export const validateResolutionNotes = (notes) => {
    const errors = [];

    if (!notes || notes.trim() === '') {
        errors.push('Resolution notes are required');
    } else if (notes.length < 10) {
        errors.push('Resolution notes must be at least 10 characters long');
    } else if (notes.length > 2000) {
        errors.push('Resolution notes must not exceed 2000 characters');
    }

    return errors;
};

export const validateComment = (comment) => {
    const errors = [];

    if (!comment || comment.trim() === '') {
        errors.push('Comment cannot be empty');
    } else if (comment.length < 2) {
        errors.push('Comment must be at least 2 characters long');
    } else if (comment.length > 1000) {
        errors.push('Comment must not exceed 1000 characters');
    }

    return errors;
};

export const validateRejectionReason = (reason) => {
    const errors = [];

    if (!reason || reason.trim() === '') {
        errors.push('Rejection reason is required');
    } else if (reason.length < 10) {
        errors.push('Rejection reason must be at least 10 characters long');
    } else if (reason.length > 500) {
        errors.push('Rejection reason must not exceed 500 characters');
    }

    return errors;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
