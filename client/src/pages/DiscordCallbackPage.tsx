import DiscordCallback from "@/components/store/discord/DiscordCallback.tsx";
import {setTitle} from "@/App.tsx";

function DiscordCallbackPage() {
    setTitle('Discord')

    return <DiscordCallback />;
}

export default DiscordCallbackPage;
