import toast from 'react-hot-toast';

export const getNotificationPreferences = () => {
    const defaultPreferences = {
        approved: true,
        rejected: true,
        created: true
    };

    try {
        const stored = localStorage.getItem('notificationPreferences');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to parse notification preferences', error);
    }

    return defaultPreferences;
};

export const getNotifications = () => {
    try {
        const stored = localStorage.getItem('notifications');
        if (stored) return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to parse notifications', error);
    }
    return [];
};

export const addNotification = ({ message, type }) => {
    const list = getNotifications();
    const newNotification = {
        id: Date.now(),
        message,
        type,
        read: false,
        timestamp: new Date().toISOString()
    };

    const updatedList = [newNotification, ...list].slice(0, 10);
    localStorage.setItem('notifications', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('notificationsUpdated'));
};

export const markAllAsRead = () => {
    const list = getNotifications();
    const updatedList = list.map((notification) => ({ ...notification, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('notificationsUpdated'));
};

export const notify = ({ message, type }) => {
    const preferences = getNotificationPreferences();

    if (preferences[type] !== false) {
        if (type === 'rejected') {
            toast.error(message);
        } else {
            toast.success(message);
        }
    }

    addNotification({ message, type });
};
