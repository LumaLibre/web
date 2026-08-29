import {useState, type ReactNode} from "react";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
} from "react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import styles from "./App.module.scss";
import "./index.css";

export const links = () => [
    {rel: "icon", type: "image/webp", href: "/LumaLogoMin.webp"},
    {rel: "preconnect", href: "https://cdnjs.cloudflare.com"},
    {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
    },
];

export function Layout({children}: {children: ReactNode}) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="theme-color" content="#B986F9"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        {children}
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export default function Root() {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <div className={styles.appContainer}>
                <Outlet/>
            </div>
        </QueryClientProvider>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    const status = isRouteErrorResponse(error) ? error.status : 500;
    const message = status === 404
        ? "The page you're looking for doesn't exist."
        : "Something went wrong while rendering this page.";

    return (
        <main style={{minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem"}}>
            <div>
                <h1>{status}</h1>
                <p>{message}</p>
                <a href="/">Return home</a>
            </div>
        </main>
    );
}
