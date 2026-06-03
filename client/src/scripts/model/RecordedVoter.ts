import {API_ENDPOINT} from "@/constants.ts";


export class RecordedVoter {
    static poses: Map<string, string> = new Map([
        ["wave", "?yaw=30&pitch=10&trim=true&padding=0&scale=26"],
        ["cute", "?yaw=30&pitch=10&trim=true&padding=0&scale=26"],
        ["praise", "?yaw=-5&pitch=0&trim=true&padding=0&scale=26"],
        ["sitting", "?yaw=-5&pitch=0&trim=true&padding=0&scale=26"] // pad 20
    ]);

    uuid: string;
    votes: number;
    name?: string;

    constructor(uuid: string, votes: number, name?: string) {
        this.uuid = uuid;
        this.votes = votes;
        this.name = name;
    }

    getHeadRenderURL(): string {
        //return `https://starlightskins.lunareclipse.studio/render/mojavatar/${this.uuid}/bust`;
        return `${API_ENDPOINT}/render/wave/${this.uuid}?yaw=30&pitch=10&trim=true&scale=2`;
    }

    getBodyRenderURL(pos: number): string {
        //return `https://starlightskins.lunareclipse.studio/render/mojavatar/${this.uuid}/full`;
        const entries = [...RecordedVoter.poses.entries()];
        const [pose, args] = entries[(pos - 1) % entries.length];
        return `https://lumamc.net/api/render/${pose}/${this.uuid}${args}`;
    }
}