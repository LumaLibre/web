import {useSearchParams} from "react-router-dom";
import NewsPageContent from "@/components/news/NewsPageContent.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {fetchNewsSummaries} from "@/scripts/newsPosts.ts";
import {reviveNewsPostSummary} from "@/scripts/model/NewsPost.ts";
import {serverApiUrl} from "@/serverApi.ts";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({
    title: "News",
    description: "Read the latest updates, events, and announcements from LumaMC.",
    path: "/news",
});

export async function loader() {
    const newsPosts = await fetchNewsSummaries(undefined, serverApiUrl("/api"));
    return {newsPosts};
}

function NewsPage({loaderData}: {loaderData: Awaited<ReturnType<typeof loader>>}) {
    const newsPosts = loaderData.newsPosts.map(reviveNewsPostSummary);

    const [searchParams] = useSearchParams();
    // Default to page 1 if not provided
    const page = parseInt(searchParams.get("page") || "1", 10);

    return (
        <div>
            <Navbar />
            <NewsPageContent page={page} initialNewsPosts={newsPosts}/>
            <Footer />
        </div>
    );
}

export default NewsPage;
