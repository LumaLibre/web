import {normalizeMinecraftUsername} from "./minecraftUsername.ts";

export interface StoreLink {
    packageIds: number[];
    quantity: number;
    username?: string;
    checkout: boolean;
    promptUsername: boolean;
}

export function parseStoreLink(pathname: string, search: string): StoreLink {
    const params = new URLSearchParams(search);
    const path = pathname.replace(/\/+$/, "");
    const packagesEndpoint = path.endsWith("/packages");
    const usernameEndpoint = path.endsWith("/username");
    const action = params.get("action");
    if (action !== null && action !== "add") throw new Error("This link uses an unsupported basket action.");

    const positiveInteger = (value: string, label: string) => {
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
            throw new Error(`This link has an invalid ${label}.`);
        }
        return Number(value);
    };
    const packageIds = [...new Set(params.getAll("package")
        .flatMap(value => value.split(","))
        .map(value => positiveInteger(value.trim(), "package ID")))];
    if ((packagesEndpoint || action === "add") && packageIds.length === 0) {
        throw new Error("This link is missing a package ID.");
    }
    const quantity = positiveInteger(params.get("quantity") ?? "1", "quantity");
    const checkoutValue = params.get("checkout");
    if (checkoutValue !== null && !["1", "true", "0", "false"].includes(checkoutValue)) {
        throw new Error("This link has an invalid checkout value. Use 1 or 0.");
    }
    const edition = params.get("edition");
    if (edition !== null && edition !== "java" && edition !== "bedrock") {
        throw new Error("This link has an invalid Minecraft edition.");
    }
    const username = params.has("username")
        ? normalizeMinecraftUsername(params.get("username")!, edition ?? "java")
        : undefined;
    if (username === "") throw new Error("This link has an empty username.");

    return {
        packageIds, quantity, username,
        checkout: checkoutValue === null ? !packagesEndpoint && !usernameEndpoint : ["1", "true"].includes(checkoutValue),
        promptUsername: usernameEndpoint
    };
}

export function storeLinkReturnPath(link: StoreLink, nextPackage: number): string {
    const params = new URLSearchParams({quantity: String(link.quantity), checkout: link.checkout ? "1" : "0"});
    for (const id of link.packageIds.slice(nextPackage)) params.append("package", String(id));
    return `/checkout?${params}`;
}
