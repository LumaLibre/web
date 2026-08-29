import type {Config} from "@react-router/dev/config";

export default {
    appDirectory: "src",
    ssr: true,
    // These pages contain no runtime-owned content and can be served as static HTML.
    // News, home, and store stay request-rendered so current backend data is included.
    prerender: ["/rules", "/privacy", "/vote"],
} satisfies Config;
