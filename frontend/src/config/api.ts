
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