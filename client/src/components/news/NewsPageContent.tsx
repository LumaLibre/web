import {useQuery} from "@tanstack/react-query";
import styles from "./NewsPageContent.module.scss";
import PostCard from "@/components/news/components/postcard/PostCard.tsx";
import {NewsPostContainer} from "@/scripts/model/NewsPostContainer.tsx";
import {fetchAllNewsPosts} from "@/scripts/newsPosts.ts";
import {JSX, useEffect, useState} from "react";
import Label from "@/components/label/Label.tsx";
import NotFoundPageContent from "@/components/etc/404/404PageContent.tsx";
import LoadingPageContent from "@/components/loading/LoadingPageContent.tsx";
import {Link} from "react-router-dom";


const newsStyleSection = (element: JSX.Element) => {
    return (
        <section className={styles.newsPageBackground}>
            <Label />
            {element}
        </section>
    );
};

const pageRef: string = "/news?page=";


function NewsPageContent({ page }: { page: number }) {
    const [postsPerPage, setPostsPerPage] = useState(8);

    useEffect(() => {
        const updatePostsPerPage = () => {
            if (window.innerWidth <= 768) {
                setPostsPerPage(8); // Phone
            } else {
                setPostsPerPage(9); // Default
            }
        };

        updatePostsPerPage();
        window.addEventListener("resize", updatePostsPerPage);
        return () => window.removeEventListener("resize", updatePostsPerPage);
    }, []);

    const {
        data: newsPosts,
        isLoading,
        error,
    } = useQuery<NewsPostContainer[]>({
        queryKey: ["allNewsPosts"],
        queryFn: fetchAllNewsPosts,
    });

    if (isLoading) return <LoadingPageContent />;
    if (error) return <NotFoundPageContent error={error.message} />;
    if (!newsPosts) return <NotFoundPageContent />;

    // Pagination logic
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = newsPosts.slice(startIndex, endIndex);
    const numOfPages = Math.ceil(newsPosts.length / postsPerPage);

    if (paginatedPosts.length === 0) {
        return <NotFoundPageContent error="No news posts found." />
    }

    return newsStyleSection(
        <div className={styles.postList}>
            {paginatedPosts.map((post: NewsPostContainer) => (
                <PostCard newsPost={post} key={post.id}/>
            ))}
            <div className={styles.carouselNav}>
                <Link
                    className={styles.carouselNavBack}
                    to={`${pageRef}${Math.max(1, page - 1)}`}
                    onClick={(e) => {
                        if (page === 1) {
                            e.preventDefault();
                        }
                    }}
                >
                    <div className={styles.carouselArrow} />
                </Link>
                {Array.from({ length: numOfPages }, (_, i) => (
                    <Link key={i} className={styles.carouselNavDot} to={`${pageRef}${i + 1}`}/>
                ))}
                <Link
                    className={styles.carouselNavForward}
                    to={`${pageRef}${Math.min(numOfPages, page + 1)}`}
                    onClick={(e) => {
                        if (page === numOfPages) {
                            e.preventDefault();
                        }
                    }}
                >
                    <div className={styles.carouselArrow} />
                </Link>
            </div>
        </div>
    );
}

export default NewsPageContent;
