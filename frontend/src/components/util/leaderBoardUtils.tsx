export interface LeaderBoard {
	username: string;
	wins: number;
	losses: number;
}

export async function fetchLeaderBoard() : Promise<LeaderBoard[] | null> {
	const response = await fetch('/api/games/leaderboard')
	if (response.ok) {
		const data = await response.json();
		const list = data.data ?? [];
        return Array.isArray(list) ? list : [];
	}
	return null;
}