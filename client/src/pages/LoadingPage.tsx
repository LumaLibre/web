import LoadingPageContent from "@/components/loading/LoadingPageContent.tsx";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({title: "Loading", path: "/loading", noIndex: true});

function LoadingPage() {
    return (
        <div>
            <LoadingPageContent />
        </div>
    );
}

export default LoadingPage;
