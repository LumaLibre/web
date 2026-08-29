import {useLocation, useNavigate, useParams} from "react-router-dom";
import NewsPostPageContent from "@/components/news/NewsPostPageContent.tsx";
import {loadNewsPostBody} from "@/components/news/newsPostBodyLoader.ts";
import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {setTitle} from "@/App.tsx";
import {useEffect} from "react";
import {newsPostPath} from "@/scripts/newsPosts.ts";

/**
 * A component that displays a news post based on the URL.
 * @constructor NewsPostPage
 */
function NewsPostPage() {
    setTitle('News Post');

    useEffect(() => {
        void loadNewsPostBody();
    }, []);

    const {id: routeId} = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const id = routeId ? `${routeId}${location.hash}` : null;

    useEffect(() => {
        if (id && location.hash) {
            navigate(newsPostPath(id), {replace: true});
        }
    }, [id, location.hash, navigate]);

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
