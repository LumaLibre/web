import {API_ENDPOINT} from "@/constants.ts";
import {RecordedVoter} from "@/scripts/model/RecordedVoter.ts";

// Pose table is shared with the vote page so renders stay consistent.
export function playerBodyRenderUrl(id: string, index: number): string {
    const poses = [...RecordedVoter.poses.entries()];
    const [pose, args] = poses[Math.abs(index) % poses.length];
    return `${API_ENDPOINT}/render/${pose}/${encodeURIComponent(id)}${args}`;
}

export function playerFaceUrl(id: string): string {
    return `${API_ENDPOINT}/render/wave/${encodeURIComponent(id)}?yaw=30&pitch=10&trim=true&scale=1`;
}
