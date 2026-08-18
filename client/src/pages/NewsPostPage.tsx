import {useParams} from "react-router-dom";
import NewsPostPageContent from "@/components/news/NewsPostPageContent.tsx";
import {loadNewsPostBody} from "@/components/news/newsPostBodyLoader.ts";
import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {setTitle} from "@/App.tsx";
import {useEffect} from "react";

/**
 * A component that displays a news post based on the URL.
 * @constructor NewsPostPage
 */
function NewsPostPage() {
    setTitle('News Post');

    useEffect(() => {
        void loadNewsPostBody();
    }, []);

    const { id } = useParams<{ id: string }>(); // Access the `id` from the URL

    if (!id) {
        return <p>No news post id provided!</p>;
    }

    return (
        <div>
            <Navbar />
            <NewsPostPageContent id={id} />
            <Footer />
        </div>
    );
}

export default NewsPostPage;
