import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import StoreContent from "@/components/store/StoreContent.tsx";
import {BasketProvider} from "@/components/store/BasketContext.tsx";
import {fetchCategories, fetchSidebar, fetchWebstore} from "@/scripts/tebex.ts";
import type {SidebarModule, StoreCategory, Webstore} from "@/scripts/model/Tebex.ts";
import {seoMeta} from "@/seo.ts";

export const meta = () => seoMeta({
    title: "Store",
    description: "Support LumaMC and browse available ranks, keys, tags, boosters, and other packages.",
    path: "/store",
});

export async function loader() {
    const [categoriesResult, sidebarResult, webstoreResult] = await Promise.allSettled([
        fetchCategories(),
        fetchSidebar(),
        fetchWebstore(),
    ]);
    return {
        categories: categoriesResult.status === "fulfilled"
            ? categoriesResult.value
            : undefined as StoreCategory[] | undefined,
        sidebar: sidebarResult.status === "fulfilled"
            ? sidebarResult.value
            : undefined as SidebarModule[] | undefined,
        webstore: webstoreResult.status === "fulfilled"
            ? webstoreResult.value
            : undefined as Webstore | undefined,
    };
}

function StorePage({loaderData}: {loaderData: Awaited<ReturnType<typeof loader>>}) {

    return (
        <BasketProvider>
            <div>
                <Navbar />
                <StoreContent
                    initialCategories={loaderData.categories}
                    initialSidebar={loaderData.sidebar}
                    initialWebstore={loaderData.webstore}
                />
                <Footer />
            </div>
        </BasketProvider>
    );
}

export default StorePage;
