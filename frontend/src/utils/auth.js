export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};
export const clearUser = () => localStorage.removeItem('user');

export const setRole = (role) => localStorage.setItem('role', role); // fallback
export const getRole = () => getUser()?.role || localStorage.getItem('role');
export const clearRole = () => {
    clearUser();
    localStorage.removeItem('role');
};
export const isAdmin = () => getRole() === 'ADMIN';
export const isUser = () => getRole() === 'USER';
