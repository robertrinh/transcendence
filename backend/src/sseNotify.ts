/**
 * Shared SSE connection registry and send helpers.
 * Used by chat routes (stream, join, send) and friends route (notify on friend request).
 */
const sseConnections = new Map<string, { response: any; userId: number; username: string; connectedAt?: Date }>();

export function register(connectionId: string, data: { response: any; userId: number; username: string; connectedAt?: Date }) {
	sseConnections.set(connectionId, data);
}

export function get(connectionId: string) {
	return sseConnections.get(connectionId);
}

export function unregister(connectionId: string) {
	sseConnections.delete(connectionId);
}

export function getConnectionCount() {
	return sseConnections.size;
}

export function getAllConnections() {
	return Array.from(sseConnections.values());
}

function writeToConnections(connectionIds: string[], message: any) {
	const messageString = `data: ${JSON.stringify(message)}\n\n`;
	const idSet = new Set(connectionIds);
	for (const [cid, conn] of sseConnections) {
		if (!idSet.has(cid)) continue;
		try {
			if (!conn.response.destroyed) {
				conn.response.write(messageString);
			} else {
				sseConnections.delete(cid);
			}
		} catch (error) {
			console.error(`[SSE] Error sending to ${cid}:`, error);
			sseConnections.delete(cid);
		}
	}
}

export function sendToConnections(connectionIds: string[], message: any) {
	writeToConnections(connectionIds, message);
}

export function broadcast(message: any, excludeConnectionId?: string) {
	const connectionIds = excludeConnectionId
		? Array.from(sseConnections.keys()).filter((cid) => cid !== excludeConnectionId)
		: Array.from(sseConnections.keys());
	writeToConnections(connectionIds, message);
}

//* get connection IDs for a user (private messages) */
export function getConnectionIdsForUser(userId: number): string[] {
	const ids: string[] = [];
	for (const [cid, conn] of sseConnections) {
		if (conn.userId === userId) ids.push(cid);
	}
	return ids;
}

//* send SSE event only to connections for the given user (friend request notification) */
export function sendToUser(userId: number, message: any) {
	const connectionIds = getConnectionIdsForUser(userId);
	if (connectionIds.length > 0) {
		writeToConnections(connectionIds, message);
	}
}
