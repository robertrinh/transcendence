interface ImportMetaEnv {
	readonly VITE_SERVER_HOSTNAME: string
	readonly VITE_GAME_SERVER_PORT: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
