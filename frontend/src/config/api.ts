// API configuration
const getApiBaseUrl = (): string => {
    const backendPort = import.meta.env.VITE_BACKEND_PORT
    const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME
    // In Docker environment, containers communicate via service names
    // In browser, this will be resolved by Docker networking
    if (process.env.NODE_ENV === 'production') {
        return `http://backend:${backendPort}`;
    }
    
    // For development, try backend container first, then localhost
    return `http://${serverHostname}:${backendPort}`;
};

const API_BASE = '/api';

//* call when any authenticated request gets 401/404 (e.g. account deleted elsewhere). Clears token and notifies app to show login
export const notifyAuthFailure = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
};

/**
 * Authenticated fetch: adds Bearer token and kicks user back to login on 401.
 * Use for all requests that require auth (nav, chat, settings, game, etc.) so that
 * when e.g. the account was deleted in another tab, the next action here returns 401 and we redirect.
 */
export const fetchWithAuth = async (path: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers);
    if (token) 
		headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(path, { ...options, headers });
    if (response.status === 401) 
		notifyAuthFailure();
    return response;
};

// NEW: Handshake function to verify token and get user info
export const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            return null;
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        return null;
    }
};

// Login
export const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('token', data.token);
    }
    return data;
};

// Register
export const register = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('token', data.token);
    }
    return data;
};

// Logout
export const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('token');
    }
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
    auth: {
        register: `${API_BASE_URL}/api/auth/register`,
        login: `${API_BASE_URL}/api/auth/login`,
        logout: `${API_BASE_URL}/api/auth/logout`,
        validate: `${API_BASE_URL}/api/auth/validate`,
    },
    chat: {
        messages: `${API_BASE_URL}/api/chat/messages`,
        join: `${API_BASE_URL}/api/chat/join`,
        leave: `${API_BASE_URL}/api/chat/leave`,
        users: `${API_BASE_URL}/api/chat/users`,
    },
    health: `${API_BASE_URL}/api/health`,
};

// Utility function to make API calls with fallback
export const apiCall = async (url: string, options?: RequestInit): Promise<Response> => {
    try {
        // Try the configured URL first
        return await fetch(url, options);
    } catch (error) {
        // If that fails and we're trying backend container, try localhost
        if (url.includes('backend:3000')) {
            const fallbackUrl = url.replace('backend:3000', 'localhost:3000');
            console.log(`Backend container failed, trying localhost: ${fallbackUrl}`);
            return await fetch(fallbackUrl, options);
        }
        throw error;
    }
};