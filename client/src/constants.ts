export const HOST = 'https://dev.lumamc.net'; // Change to lumamc.net when deploying!
export const DATE = new Date();

export const LUMA_DISCORD_GUILD_ID = '1188316962258948149';
export const DISCORD_INV_SHORT = 'lumamc.net/chat';
export const DISCORD_INV = `https://${DISCORD_INV_SHORT}`;
export const LUMA_IP_ADDRESS = 'play.lumamc.net';

export const LUMA_SERVERSTATS_ENDPOINT = `https://api.mcsrvstat.us/2/${LUMA_IP_ADDRESS}`;
export const LUMA_DISCORD_ENDPOINT = `https://discord.com/api/guilds/${LUMA_DISCORD_GUILD_ID}/embed.json`;
export const WIKI = 'https://wiki.lumamc.net/lumamc-wiki/';
export const WIKI_LINK = (endpoint: string) => {
    if (endpoint.startsWith('/')) {
        endpoint = endpoint.substring(1);
    }
    return `${WIKI}${endpoint}`;
}

export const STORE = 'https://store.lumamc.net';

// Apis
export const API_ENDPOINT = `${HOST}/api`;
// TODO: Nest Topvoter's endpoint inside normal API endpoint
export const LUMA_TOPVOTER_ENDPOINT = `https://topvoter.lumamc.net/`;
export const MINOTAR_API = 'https://minotar.net/';
export const CRAFATAR_API = 'https://crafatar.com/';

// Should go in a utils.ts
export const INVIS_CHAR = (amt: number) => "\u00A0".repeat(amt);
export const INVIS_BORDER = (str: string, amt: number) => `${INVIS_CHAR(amt)}${str}${INVIS_CHAR(amt)}`;