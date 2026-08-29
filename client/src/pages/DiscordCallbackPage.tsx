import DiscordCallback from "@/components/store/discord/DiscordCallback.tsx";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({title: "Discord", path: "/store/discord", noIndex: true});

function DiscordCallbackPage() {
    return <DiscordCallback />;
}

export default DiscordCallbackPage;
