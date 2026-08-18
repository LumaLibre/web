const CLIENT_ID_STORAGE_HINT = "No discord client";

export const DISCORD_ID_KEY = "luma.store.discordId";
export const DISCORD_NAME_KEY = "luma.store.discordName";
const STATE_KEY = "luma.store.discordState";
const RETURN_KEY = "luma.store.discordReturn";
const PENDING_PACKAGE_KEY = "luma.store.discordPendingPackage";

export interface DiscordIdentity {
    id: string;
    username: string;
}

const read = (key: string, store: Storage): string | null => {
    try {
        return store.getItem(key);
    } catch {
        return null;
    }
};

const write = (key: string, value: string | null, store: Storage) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        value === null ? store.removeItem(key) : store.setItem(key, value);
    } catch { /* empty */ }
};

export function storedDiscordIdentity(): DiscordIdentity | null {
    const id = read(DISCORD_ID_KEY, window.localStorage);
    if (!id) {
        return null;
    }
    return {id, username: read(DISCORD_NAME_KEY, window.localStorage) ?? "Discord user"};
}

export function forgetDiscordIdentity(): void {
    write(DISCORD_ID_KEY, null, window.localStorage);
    write(DISCORD_NAME_KEY, null, window.localStorage);
}

export const discordRedirectUri = (): string => `${window.location.origin}/store/discord`;

/**
 * Sends the browser to Discord's implicit-grant authorize page.
 * @param clientId The Discord application's client ID; when blank, login is unavailable.
 * @param returnTo Path to come back to once the account is linked.
 * @param packageId Added to the basket automatically on return, if given.
 */
export function beginDiscordLogin(clientId: string, returnTo: string, packageId?: number): void {
    if (!clientId) {
        throw new Error(CLIENT_ID_STORAGE_HINT);
    }

    const state = crypto.randomUUID();
    write(STATE_KEY, state, window.sessionStorage);
    write(RETURN_KEY, returnTo, window.sessionStorage);
    write(PENDING_PACKAGE_KEY, packageId ? String(packageId) : null, window.sessionStorage);

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: discordRedirectUri(),
        response_type: "token",
        scope: "identify",
        state
    });
    window.location.href = `https://discord.com/oauth2/authorize?${params}`;
}

export function consumeReturnPath(): string {
    const target = read(RETURN_KEY, window.sessionStorage);
    write(RETURN_KEY, null, window.sessionStorage);
    return target || "/store";
}

export function consumePendingPackage(): number | null {
    const raw = read(PENDING_PACKAGE_KEY, window.sessionStorage);
    write(PENDING_PACKAGE_KEY, null, window.sessionStorage);
    const id = Number(raw);
    return raw && Number.isFinite(id) ? id : null;
}

export async function completeDiscordLogin(): Promise<DiscordIdentity> {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    window.history.replaceState(null, "", window.location.pathname);

    const error = fragment.get("error_description") ?? fragment.get("error");
    if (error) {
        throw new Error(error);
    }

    const token = fragment.get("access_token");
    const expected = read(STATE_KEY, window.sessionStorage);

    if (!token) {
        const existing = storedDiscordIdentity();
        if (existing) {
            return existing;
        }
        throw new Error("Discord did not return an access token.");
    }

    write(STATE_KEY, null, window.sessionStorage);
    if (!expected || fragment.get("state") !== expected) {
        throw new Error("Login could not be verified. Please try again.");
    }

    const response = await fetch("https://discord.com/api/users/@me", {
        headers: {Authorization: `Bearer ${token}`}
    });
    if (!response.ok) {
        throw new Error(`Discord rejected the token: ${response.status}`);
    }

    const user = await response.json() as { id: string, username: string, global_name?: string };
    const identity: DiscordIdentity = {id: user.id, username: user.global_name || user.username};

    write(DISCORD_ID_KEY, identity.id, window.localStorage);
    write(DISCORD_NAME_KEY, identity.username, window.localStorage);
    return identity;
}
