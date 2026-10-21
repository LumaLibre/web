import {isBedrockUsername} from "./minecraftUsername.ts";

const API_ENDPOINT = "/api";

export function playerRenderIdentity(id: string, username?: string): string {
    // Prefer the Bedrock identity even when a linked account supplies a Java UUID.
    if (username && isBedrockUsername(username)) {
        return /^\d{16,20}$/.test(id) ? id : username.trim();
    }
    return id || username || "";
}

export const rawPoses: Map<string, string> = new Map([
    ["helpful", "?yaw=30&pitch=10&trim=true&padding=0&scale=26"],
    ["parkour", "?yaw=15&pitch=10&trim=true&padding=0&scale=26"],
    ["gold", "?yaw=5&pitch=10&trim=true&padding=0&scale=26"],
    ["pvp", "?yaw=0&pitch=0&trim=true&padding=0&scale=26"],
    ["voter", "?yaw=-10&pitch=10&trim=true&padding=0&scale=26"]
]);

export function playerBodyRenderUrl(id: string, index: number, username?: string): string {
    const poses = [...rawPoses.entries()];
    const [pose, args] = poses[Math.abs(index) % poses.length];
    return `${API_ENDPOINT}/render/${pose}/${encodeURIComponent(playerRenderIdentity(id, username))}${args}`;
}

export function playerFaceUrl(id: string): string {
    return `${API_ENDPOINT}/render/wave/${encodeURIComponent(id)}?yaw=30&pitch=10&trim=true&scale=1`;
}

export function topSupporterRenderUrl(id: string, username?: string): string {
    return `${API_ENDPOINT}/render/trophy/${encodeURIComponent(playerRenderIdentity(id, username))}?yaw=1&pitch=5&trim=true&padding=0&scale=26`;
}
