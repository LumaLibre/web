import {useQuery} from "@tanstack/react-query";
import {RecordedVoter} from "@/scripts/model/RecordedVoter.ts";
import {fetchTopVotersList} from "@/scripts/topVoters.ts";
import TopVoter from "@/components/vote/components/topvoter/TopVoter.tsx";

const TopVoters = ({ from, to }: { from: number, to: number }) => {
    const { data: topVoterList, isLoading, isError } = useQuery<RecordedVoter[]>({
        queryKey: ["topVoters"],
        queryFn: () => fetchTopVotersList(from, to)
    });

    if (isLoading) return <h1>Loading...</h1>;
    if (isError) return <h1>Error fetching top voters</h1>;

    return (
        <>
            {topVoterList?.map((topVoter, i) => (
                <TopVoter key={topVoter.uuid} recordedVoter={topVoter} index={i + 1} />
            ))}
        </>
    );
};

export default TopVoters;