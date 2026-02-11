
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
        return `https://starlightskins.lunareclipse.studio/render/mojavatar/${this.uuid}/bust`;
    }

    getBodyRenderURL(): string {
        return `https://starlightskins.lunareclipse.studio/render/mojavatar/${this.uuid}/full`;
    }
}