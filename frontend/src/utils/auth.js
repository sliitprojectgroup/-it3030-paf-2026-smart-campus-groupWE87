export const DEMO_USERS = {
    USER: {
        id: 1,
        name: 'Deshan Perera',
        email: 'deshan@sliit.lk',
        role: 'USER'
    },
    ADMIN: {
        id: 10,
        name: 'Kulitha Jayawardena',
        email: 'kulitha@sliit.lk',
        role: 'ADMIN'
    }
};

export const DEMO_CREDENTIALS = {
    USER: {
        email: 'deshan@sliit.lk',
        password: '123'
    },
    ADMIN: {
        email: 'kulitha@sliit.lk',
        password: '123'
    }
};

export const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id);
    localStorage.setItem('role', user.role);
    localStorage.setItem('name', user.name);
};

export const setDemoUser = (role = 'USER') => {
    const user = DEMO_USERS[role] || DEMO_USERS.USER;
    setUser(user);
    return user;
};
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
const normalizeUserId = (value) => {
    const userId = Number(value);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
};
export const getUserId = () => normalizeUserId(getUser()?.id) || normalizeUserId(localStorage.getItem('userId'));
export const clearRole = () => {
    clearUser();
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
};
export const isAdmin = () => getRole() === 'ADMIN';
export const isUser = () => getRole() === 'USER';

export const getDemoCredentialsForUser = (user = getUser()) => {
    if (!user?.email) return null;
    return Object.values(DEMO_CREDENTIALS).find((credentials) => credentials.email === user.email) || null;
};
