import {useSearchParams} from "react-router-dom";
import NewsPageContent from "@/components/news/NewsPageContent.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {setTitle} from "@/App.tsx";


function NewsPage() {
    setTitle('News');

    const [searchParams] = useSearchParams();
    // Default to page 1 if not provided
    const page = parseInt(searchParams.get("page") || "1", 10);

    return (
        <div>
            <Navbar />
            <NewsPageContent page={page} />
            <Footer />
        </div>
    );
}

export default NewsPage;