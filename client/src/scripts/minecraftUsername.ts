export type MinecraftEdition = "java" | "bedrock";

export const isBedrockUsername = (name: string): boolean => name.trim().startsWith(".");

export function normalizeMinecraftUsername(name: string, edition: MinecraftEdition): string {
    const trimmed = name.trim();
    if (edition === "java" && !isBedrockUsername(trimmed)) return trimmed;
    const gamertag = trimmed.replace(/^\./, "").trim();
    return gamertag ? `.${gamertag.replace(/\s/g, "_")}` : "";
}

export async function fetchBedrockTexture(name: string, signal?: AbortSignal): Promise<string | null> {
    const gamertag = name.trim().replace(/^\./, "").replace(/_/g, " ");
    const accountResponse = await fetch(
        `https://api.geysermc.org/v2/xbox/xuid/${encodeURIComponent(gamertag)}`, {signal}
    );
    if (!accountResponse.ok) return null;
    const account = await accountResponse.json() as {xuid?: string | number};
    if (!account.xuid) return null;
    const skinResponse = await fetch(
        `https://api.geysermc.org/v2/skin/${encodeURIComponent(account.xuid)}`, {signal}
    );
    if (!skinResponse.ok) return null;
    const skin = await skinResponse.json() as {texture_id?: string};
    return skin.texture_id || null;
}
