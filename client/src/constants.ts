export const HOST = "https://lumamc.net/";
export const DATE = new Date();

export const LUMA_DISCORD_GUILD_ID = "1188316962258948149";
export const DISCORD_INV_SHORT = "lumamc.net/chat";
export const DISCORD_INV = `https://${DISCORD_INV_SHORT}`;
export const LUMA_IP_ADDRESS = "play.lumamc.net";

export const LUMA_SERVERSTATS_ENDPOINT = `https://api.mcsrvstat.us/2/${LUMA_IP_ADDRESS}`;
export const LUMA_DISCORD_ENDPOINT = `https://discord.com/api/guilds/${LUMA_DISCORD_GUILD_ID}/embed.json`;
export const WIKI = "https://wiki.lumamc.net/";
export const WIKI_LINK = (endpoint: string) => {
  if (endpoint.startsWith("/")) {
    endpoint = endpoint.substring(1);
  }
  return `${WIKI}${endpoint}`;
};

export const STORE = `${HOST}store`
export const TEBEX_PUBLIC_TOKEN = "thl1-b56d66035505068200ecc30aad8c3e5f417c08e4"; // non-sensitive token
export const TEBEX_HEADLESS_ENDPOINT = `https://headless.tebex.io/api/accounts/${TEBEX_PUBLIC_TOKEN}`;
export const TEBEX_BASKETS_ENDPOINT = "https://headless.tebex.io/api/baskets";

export const STORE_PAYMENT_METHODS = [
    "visa",
    "mastercard",
    "amex",
    "paypal",
    "applepay",
    "googlepay"
] as const;

export type StorePaymentMethod = typeof STORE_PAYMENT_METHODS[number];

export const DISCORD_PUBLIC_CLIENT_ID: string = "1187474945815621762"; // non-sensitive
const ORIGIN = typeof window === "undefined" ? HOST.replace(/\/$/, "") : window.location.origin;
export const STORE_COMPLETE_URL = `${ORIGIN}/store/complete`;
export const STORE_CANCEL_URL = `${ORIGIN}/store`;

// Apis
export const API_ENDPOINT = `${HOST}api`;
// TODO: Nest Topvoter's endpoint inside normal API endpoint
export const LUMA_TOPVOTER_ENDPOINT = `https://topvoter.lumamc.net/`;
export const MINOTAR_API = "https://minotar.net/";
