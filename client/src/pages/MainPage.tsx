import Header from "@/components/homepage/header/Header.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {fetchNewsSummaries} from "@/scripts/newsPosts.ts";
import {reviveNewsPostSummary, type NewsPostSummaryData} from "@/scripts/model/NewsPost.ts";
import {serverApiUrl} from "@/serverApi.ts";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({title: "Home"});

export async function loader() {
    try {
        const newsPosts = await fetchNewsSummaries(3, serverApiUrl("/api"));
        return {newsPosts};
    } catch {
        return {newsPosts: [] as NewsPostSummaryData[]};
    }
}

function MainPage({loaderData}: {loaderData: Awaited<ReturnType<typeof loader>>}) {
    const newsPosts = loaderData.newsPosts.map(reviveNewsPostSummary);

    return (
        <div>
            <Header initialNewsPosts={newsPosts}/>
            <Footer />
        </div>
    );
}

export default MainPage;
