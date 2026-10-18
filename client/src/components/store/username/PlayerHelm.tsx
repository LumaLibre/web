import {useQuery} from "@tanstack/react-query";
import {MC_HEADS_API, MINOTAR_API} from "@/constants.ts";
import {fetchBedrockTexture, isBedrockUsername} from "@/scripts/minecraftUsername.ts";

export default function PlayerHelm({username}: {username: string}) {
    const bedrock = isBedrockUsername(username);
    const {data: texture} = useQuery({
        queryKey: ["bedrockSkin", username],
        queryFn: ({signal}) => fetchBedrockTexture(username, signal),
        enabled: bedrock,
        staleTime: 60 * 60 * 1000,
        retry: false
    });
    const fallback = `${MC_HEADS_API}avatar/MHF_Steve/32`;
    const src = bedrock
        ? texture ? `${MC_HEADS_API}avatar/${encodeURIComponent(texture)}/32` : fallback
        : `${MINOTAR_API}helm/${encodeURIComponent(username)}/32`;

    return <img key={src} src={src} alt="" aria-hidden="true" onError={event => {
        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
    }}/>;
}
