// API configuration
const getApiBaseUrl = (): string => {
    // In Docker environment, containers communicate via service names
    // In browser, this will be resolved by Docker networking
    if (process.env.NODE_ENV === 'production') {
        return 'http://backend:3000';
    }
    
    // For development, try backend container first, then localhost
    return 'http://localhost:3000';
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