import React, {useEffect} from "react";
import styles from "./App.module.scss";
import {Routes, Route} from "react-router-dom";
import MainPage from "@/pages/MainPage.tsx"; // We're not going to lazy this page since it's the first one we see.
import LoadingPage from "@/pages/LoadingPage.tsx";

const RulesPage = React.lazy(() => import("@/pages/RulesPage.tsx"));
const VotePage = React.lazy(() => import("@/pages/VotePage.tsx"));
const NewsPage = React.lazy(() => import("@/pages/NewsPage.tsx"));
const NewsPostPage = React.lazy(() => import("@/pages/NewsPostPage.tsx"));
const PrivacyPage = React.lazy(() => import("@/pages/PrivacyPage.tsx"));
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
                <Route path="/vote" element={<Lazy><VotePage /></Lazy>} />
                <Route path="/news" element={<Lazy><NewsPage /></Lazy>} />
                <Route path="/news/:id" element={<Lazy><NewsPostPage /></Lazy>} />
                <Route path="/privacy" element={<Lazy><PrivacyPage /></Lazy>} />
                <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
            </Routes>
        </div>
    );
}

export default App;
