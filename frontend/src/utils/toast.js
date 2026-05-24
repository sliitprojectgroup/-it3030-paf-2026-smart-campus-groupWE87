/**
 * Toast Notification Utility
 * Provides simple toast notification functions
 */

export const showToast = (message, type = 'info', duration = 3000) => {
    // Create a simple notification element
    const toastId = `toast-${Date.now()}`;
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
            <span>${escapeHtml(message)}</span>
            <button class="ml-2 font-bold text-lg hover:opacity-70" onclick="document.getElementById('${toastId}').remove()">✕</button>
        </div>
    `;

    // Add styling
    const style = {
        'info': 'bg-blue-500 text-white',
        'success': 'bg-green-500 text-white',
        'error': 'bg-red-500 text-white',
        'warning': 'bg-yellow-500 text-white'
    };

    toast.firstChild.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${style[type] || style['info']}`;

    toastContainer.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    return toast;
};

export const showSuccessToast = (message, duration = 3000) => showToast(message, 'success', duration);
export const showErrorToast = (message, duration = 5000) => showToast(message, 'error', duration);
export const showWarningToast = (message, duration = 4000) => showToast(message, 'warning', duration);
export const showInfoToast = (message, duration = 3000) => showToast(message, 'info', duration);

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
    return container;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
