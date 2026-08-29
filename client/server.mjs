import express from "express";
import {Readable} from "node:stream";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {existsSync} from "node:fs";
import {createRequestHandler} from "@react-router/express";

const app = express();
app.set("trust proxy", true);
const here = path.dirname(fileURLToPath(import.meta.url));
const buildRoot = existsSync(path.join(here, "client"))
    ? here
    : path.join(here, "build");
const backendPort = Number(process.env.LUMA_BACKEND_PORT ?? 7070);
const backendOrigin = process.env.LUMA_BACKEND_ORIGIN ?? `http://127.0.0.1:${backendPort}`;
const port = Number(process.env.PORT ?? process.env.SERVER_PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

process.env.LUMA_BACKEND_ORIGIN = backendOrigin;

async function proxyToJavalin(request, response, next) {
    try {
        const target = new URL(request.originalUrl, backendOrigin);
        const headers = new Headers();
        for (const [name, value] of Object.entries(request.headers)) {
            if (value !== undefined && !["host", "content-length"].includes(name.toLowerCase())) {
                headers.set(name, Array.isArray(value) ? value.join(", ") : value);
            }
        }
        headers.set("x-forwarded-host", request.get("host") ?? "");
        headers.set("x-forwarded-proto", request.protocol);

        const upstream = await fetch(target, {
            method: request.method,
            headers,
            body: ["GET", "HEAD"].includes(request.method) ? undefined : request,
            duplex: "half",
            redirect: "manual",
            signal: AbortSignal.timeout(15_000),
        });
        response.status(upstream.status);
        upstream.headers.forEach((value, name) => {
            if (!["content-encoding", "content-length", "transfer-encoding", "connection"].includes(name.toLowerCase())) {
                response.setHeader(name, value);
            }
        });
        if (upstream.body) {
            Readable.fromWeb(upstream.body).pipe(response);
        } else {
            response.end();
        }
    } catch (error) {
        if (!response.headersSent) {
            response.status(502).type("text/plain").send("Backend unavailable");
        } else {
            next(error);
        }
    }
}

app.use(["/api", "/chat", "/discord"], proxyToJavalin);
app.use("/assets", express.static(path.join(buildRoot, "client/assets"), {
    immutable: true,
    maxAge: "1y",
}));
app.use(express.static(path.join(buildRoot, "client"), {
    index: false,
    redirect: false,
    maxAge: "1h",
}));
app.all("*", createRequestHandler({
    build: () => import("./build/server/index.js"),
}));

const httpServer = app.listen(port, host, () => {
    console.log(`LumaMC SSR listening on http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
        httpServer.close(() => process.exit(0));
    });
}
