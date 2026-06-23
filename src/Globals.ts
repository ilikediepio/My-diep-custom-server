import type Client from "./Client";

export const liveClients = new Set<Client>();

export function getLivePlayers() {
    const players: { ip: string; name: string }[] = [];

    for (const c of liveClients) {
        const ip = c.ws?.getUserData().ipAddress;
        const name =
            c.camera?.cameraData?.player?.nameData?.values.name ||
            "Unnamed";

        if (!ip) continue;

        players.push({ ip, name });
    }

    return players;
}