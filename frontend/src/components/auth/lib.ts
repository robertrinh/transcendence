const backendPort = import.meta.env.VITE_BACKEND_PORT
const serverHostname = import.meta.env.VITE_SERVER_HOSTNAME

// For Docker containers, use the backend container name
// For development outside Docker, use localhost
export function getApiUrl() {
    // Check if we're in a Docker environment
	if (typeof window !== 'undefined') {
        // Browser environment - check if we can reach backend container
		return `http://backend:${backendPort}`;
	}
	return `http://${serverHostname}:${backendPort}`;
};
