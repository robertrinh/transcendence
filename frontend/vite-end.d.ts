interface ImportMetaEnv {
	readonly VITE_SERVER_HOSTNAME: string
	readonly VITE_GAME_SERVER_PORT: string
	readonly VITE_BACKEND_PORT: string
	readonly VITE_FRONTEND_PORT: string
	readonly VITE_USE_WSS: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
