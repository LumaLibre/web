import type {MetaDescriptor} from "react-router";
import {HOST} from "@/constants.ts";

const DEFAULT_DESCRIPTION = "A Towny server focused on high-quality gameplay with a vibrant, welcoming community.";
const DEFAULT_IMAGE = "https://github.com/LumaLibre/artwork/blob/master/backgrounds/playground-d3.png?raw=true";

interface SeoOptions {
    title: string;
    description?: string;
    path?: string;
    image?: string;
    noIndex?: boolean;
    type?: "website" | "article";
}

export function seoMeta({
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    image = DEFAULT_IMAGE,
    noIndex = false,
    type = "website",
}: SeoOptions): MetaDescriptor[] {
    const pageTitle = title === "Home" ? "LumaMC" : `${title} • LumaMC`;
    const canonical = new URL(path, HOST).toString();

    return [
        {title: pageTitle},
        {name: "description", content: description},
        ...(noIndex ? [{name: "robots", content: "noindex, nofollow"}] : []),
        ...(!noIndex ? [{tagName: "link", rel: "canonical", href: canonical}] : []),
        {property: "og:title", content: pageTitle},
        {property: "og:description", content: description},
        {property: "og:url", content: canonical},
        {property: "og:type", content: type},
        {property: "og:image", content: image},
        {name: "twitter:card", content: "summary_large_image"},
    ];
}
