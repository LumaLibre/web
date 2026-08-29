import React, {useEffect} from "react";
import styles from "./App.module.scss";
import {Routes, Route} from "react-router-dom";
import MainPage from "@/pages/MainPage.tsx"; // We're not going to lazy this page since it's the first one we see.
import DiscordCallbackPage from "@/pages/DiscordCallbackPage.tsx";
import LoadingPage from "@/pages/LoadingPage.tsx";
import VotePage from "@/pages/VotePage.tsx";
import RulesPage from "@/pages/RulesPage.tsx";
import NewsPostPage from "@/pages/NewsPostPage.tsx";

const NewsPage = React.lazy(() => import("@/pages/NewsPage.tsx"));
const PrivacyPage = React.lazy(() => import("@/pages/PrivacyPage.tsx"));
const StorePage = React.lazy(() => import("@/pages/StorePage.tsx"));
const StoreCompletePage = React.lazy(() => import("@/pages/StoreCompletePage.tsx"));
const NotFoundPage = React.lazy(() => import("@/pages/404Page.tsx"));


export const setTitle = (title: string) => {
    useEffect(() => {
        document.title = `${title} • LumaMC`;
    }, [title]);
};

const Lazy = ({ children }: { children: React.ReactNode }) => {
    return (
        <React.Suspense fallback={<LoadingPage />}>
            {children}
        </React.Suspense>
    );
};


function App() {
    return (
        <div className={styles.appContainer}>
            <Routes>
                <Route path="/loading" element={<LoadingPage />} />
                <Route path="/" element={<MainPage />}/>
                <Route path="/rules" element={<Lazy><RulesPage /></Lazy>} />
                <Route path="/vote" element={<VotePage />} />
                <Route path="/news" element={<Lazy><NewsPage /></Lazy>} />
                <Route path="/news/:id" element={<NewsPostPage />} />
                <Route path="/privacy" element={<Lazy><PrivacyPage /></Lazy>} />
                <Route path="/store/complete" element={<Lazy><StoreCompletePage /></Lazy>} />
                <Route path="/store/discord" element={<Lazy><DiscordCallbackPage /></Lazy>} />
                <Route path="/store" element={<Lazy><StorePage /></Lazy>} />
                <Route path="/store/:categorySlug" element={<Lazy><StorePage /></Lazy>} />
                <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
            </Routes>
        </div>
    );
}

export default App;
