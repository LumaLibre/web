import {CRAFATAR_API} from "@/constants.ts";

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
        return `${CRAFATAR_API}renders/head/${this.uuid}?overlay=true`;
    }

    getBodyRenderURL(): string {
        return `${CRAFATAR_API}renders/body/${this.uuid}?overlay=true`;
    }
}