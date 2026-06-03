import {API_ENDPOINT} from "@/constants.ts";

export class RecordedVoter {
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
        return `${API_ENDPOINT}/render/wave/${this.uuid}?yaw=30&pitch=10&trim=true`;
    }

    getBodyRenderURL(): string {
        //return `https://starlightskins.lunareclipse.studio/render/mojavatar/${this.uuid}/full`;
        return `${API_ENDPOINT}/render/cute/${this.uuid}?yaw=30&pitch=10&trim=true&padding=4`
    }
}