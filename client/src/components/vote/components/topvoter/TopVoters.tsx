import {useQuery} from "@tanstack/react-query";
import {RecordedVoter} from "@/scripts/model/RecordedVoter.ts";
import {fetchTopVotersList} from "@/scripts/topVoters.ts";
import TopVoter from "@/components/vote/components/topvoter/TopVoter.tsx";
import styles from "./TopVoters.module.scss";

const TopVoters = ({ from, to }: { from: number, to: number }) => {
    const { data: topVoterList, isLoading, isError } = useQuery<RecordedVoter[]>({
        queryKey: ["topVoters"],
        queryFn: () => fetchTopVotersList(from, to)
    });

    if (isLoading) {
        return (
            <div className={styles.list} aria-label="Loading top voters">
                {[2, 1, 3].map(rank => <div className={styles.skeleton} key={rank}/>) }
            </div>
        );
    }
    if (isError) return <p className={styles.message}>Top voters are unavailable right now.</p>;

    const ranked = topVoterList?.slice(0, 3).map((voter, index) => ({voter, rank: index + 1})) ?? [];
    const displayOrder = [ranked[1], ranked[0], ranked[2]].filter(Boolean);

    return (
        <div className={styles.list}>
            {displayOrder.map(({voter, rank}) => (
                <TopVoter key={voter.uuid} recordedVoter={voter} index={rank}/>
            ))}
        </div>
    );
};

export default TopVoters;
