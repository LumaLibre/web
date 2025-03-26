import {LUMA_DISCORD_ENDPOINT, LUMA_SERVERSTATS_ENDPOINT} from "@/constants.ts";

const failed = '?';


export const fetchServerStatusAppend = async (prefix: string, suffix: string) => {
    return `${prefix}${await fetchServerStatus()}${suffix}`;
}

/**
 * Fetches the server status from the mcserverstatus API.
 * @returns A string indicating the number of players online or a failure message.
 */
export async function fetchServerStatus(): Promise<string> {
    const playersOnline = 'Players Online';

    try {
        // Fetch data from the API
        const response = await fetch(LUMA_SERVERSTATS_ENDPOINT);

        // Check if the response is okay
        if (!response.ok) {
            console.error('Failed to fetch server status:', response.statusText);
            return failed;
        }
        const data = await response.json();
        if (data.online) { // are we online?
            return `${data.players.online.toString()} ${playersOnline}`;
        } else {
            return `0 ${playersOnline}`;
        }
    } catch (error) {
        console.error("Error fetching Luma's server status:", error);
        return `${failed} ${playersOnline}`;
    }
}

/**
 * Fetches the Discord status from the Discord API.
 * @returns A string indicating the number of users online or a failure message.
 */
export async function fetchDiscordStatus(): Promise<string> {
    const usersOnline = 'Users Online';

    try {
        const response = await fetch(LUMA_DISCORD_ENDPOINT);
        if (!response.ok) {
            console.error('Failed to fetch Discord status:', response.statusText);
            return `${failed} ${usersOnline}`;
        }
        const data = await response.json();
        return `${data.presence_count.toString()} ${usersOnline}`;
    } catch (error) {
        console.error("Error fetching Luma's Discord status:", error);
        return `${failed} ${usersOnline}`;
    }
}
