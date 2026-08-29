import {index, route, type RouteConfig} from "@react-router/dev/routes";

export default [
    index("./pages/MainPage.tsx"),
    route("loading", "./pages/LoadingPage.tsx"),
    route("rules", "./pages/RulesPage.tsx"),
    route("vote", "./pages/VotePage.tsx"),
    route("news", "./pages/NewsPage.tsx"),
    route("news/:id", "./pages/NewsPostPage.tsx"),
    route("privacy", "./pages/PrivacyPage.tsx"),
    route("store/complete", "./pages/StoreCompletePage.tsx"),
    route("store/discord", "./pages/DiscordCallbackPage.tsx"),
    route("store", "./pages/StorePage.tsx", {id: "store-index"}),
    route("store/:categorySlug", "./pages/StorePage.tsx", {id: "store-category"}),
    route("robots.txt", "./routes/robots.ts"),
    route("sitemap.xml", "./routes/sitemap.ts"),
    route("*", "./pages/404Page.tsx"),
] satisfies RouteConfig;
