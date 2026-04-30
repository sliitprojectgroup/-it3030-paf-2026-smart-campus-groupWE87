import toast from 'react-hot-toast';

export const getNotificationPreferences = () => {
    const defaultPreferences = {
        approved: true,
        rejected: true,
        created: true
    };
    
    try {
        const stored = localStorage.getItem("notificationPreferences");
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse notification preferences", e);
    }
    
    return defaultPreferences;
};

export const getNotifications = () => {
    try {
        const stored = localStorage.getItem("notifications");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse notifications", e);
    }
    return [];
};

export const addNotification = ({ message, type }) => {
    const list = getNotifications();
    const newNotif = {
        id: Date.now(),
        message,
        type,
        read: false,
        timestamp: new Date().toISOString()
    };
    
    const updatedList = [newNotif, ...list].slice(0, 10);
    localStorage.setItem("notifications", JSON.stringify(updatedList));
    window.dispatchEvent(new Event('notificationsUpdated'));
};

export const markAllAsRead = () => {
    const list = getNotifications();
    const updatedList = list.map(n => ({ ...n, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updatedList));
    window.dispatchEvent(new Event('notificationsUpdated'));
};

export const notify = ({ message, type }) => {
    const prefs = getNotificationPreferences();
    
    if (prefs[type] !== false) { // defaults to true if undefined
        if (type === 'rejected') {
            toast.error(message);
        } else {
            toast.success(message);
        }
    }
    
    addNotification({ message, type });
};