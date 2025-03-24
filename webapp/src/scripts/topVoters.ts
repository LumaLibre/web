import {LUMA_TOPVOTER_ENDPOINT} from "@/constants.ts";
import {RecordedVoter} from "@/scripts/model/RecordedVoter.ts";


/**
 * Fetches the top voters list from the TopVoter API.
 * @param from The starting index for the top voters list.
 * @param to The ending index for the top voters list.
 * @returns An array of RecordedVoter objects.
 */
export async function fetchTopVotersList(from: number, to: number): Promise<RecordedVoter[]> {
    const endpoint = `${LUMA_TOPVOTER_ENDPOINT}toplist/${from}-${to}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`Failed to fetch top voters: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();

    const recordedVoterArray = Object.values(jsonData)
        .filter((voter): voter is { uuid: string; votes: number; name?: string } =>
            typeof voter === "object" && voter !== null && "uuid" in voter && "votes" in voter
        )
        .map(voter => ({
            uuid: voter.uuid,
            votes: voter.votes,
            name: "name" in voter ? voter.name : undefined // Include name if it exists
        }));

    return recordedVoterArray.map(recordedVoter =>
        new RecordedVoter(recordedVoter.uuid, recordedVoter.votes, recordedVoter.name)
    );
}

/**
 * Fetches the top voter at a given index from the TopVoter API.
 * @param index The index of the top voter to fetch.
 */
export async function fetchTopVoter(index: number): Promise<RecordedVoter> {
    const endpoint = `${LUMA_TOPVOTER_ENDPOINT}top/${index}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`Failed to fetch top voter: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();

    if (typeof jsonData === "object" && jsonData !== null && "uuid" in jsonData && "votes" in jsonData) {
        return new RecordedVoter(
            jsonData.uuid,
            jsonData.votes,
            "name" in jsonData ? jsonData.name : undefined // Optional name
        );
    } else {
        throw new Error("Invalid voter data received");
    }
}

