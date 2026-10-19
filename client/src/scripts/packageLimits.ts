export type PackageLimit = "global" | "personal";

export interface ConfiguredLimit {
    limit: number;
    timestamp: number;
}

export interface ConfiguredPackageLimits {
    global?: ConfiguredLimit | null;
    user?: ConfiguredLimit | null;
}

export function configuredLimitLabels(limits?: ConfiguredPackageLimits): string[] {
    const labels: string[] = [];
    const global = limits?.global?.limit;
    const user = limits?.user?.limit;
    if (typeof global === "number" && Number.isSafeInteger(global) && global > 0) {
        labels.push(`Stock: ${global}`);
    }
    if (typeof user === "number" && Number.isSafeInteger(user) && user > 0) {
        labels.push(`Max of ${user} per person`);
    }
    return labels;
}

export async function fetchConfiguredPackageLimits(ident: string, signal?: AbortSignal): Promise<Record<string, ConfiguredPackageLimits>> {
    const response = await fetch(`/api/store/baskets/${encodeURIComponent(ident)}/limits`, {signal});
    if (!response.ok) throw new Error("Package limits are temporarily unavailable.");
    return response.json();
}

export async function fetchKnownPackageLimits(signal?: AbortSignal): Promise<Record<string, ConfiguredPackageLimits>> {
    const response = await fetch('/api/store/package-limits', {signal});
    if (!response.ok) throw new Error("Package limits are temporarily unavailable.");
    return response.json();
}

// Headless has no remaining-stock field. Only explicit purchase-limit failures
// establish availability; user_limit alone is not a remaining quantity.
export function purchaseLimitFromMessage(message: string): PackageLimit | null {
    if (/rate.?limit|too many requests|\b429\b/i.test(message)) return null;
    if (/sold out|out of stock/i.test(message)) return "global";
    const exhausted = /reached|exceeded|exhausted|maximum|cannot purchase|can not purchase|may not purchase|cannot buy|can only (?:purchase|buy)/i.test(message);
    if (!exhausted) return null;
    if (/global.{0,30}limit|limit.{0,30}global/i.test(message)) return "global";
    if (/(?:user|personal|customer|purchase).{0,30}limit|limit.{0,30}(?:user|personal|customer|purchase)|(?:purchase|buy).{0,60}(?:more than|maximum)|can only (?:purchase|buy).{0,60}(?:times|once)/i.test(message)) return "personal";
    return null;
}

export interface PackageLimitNotice {
    packageId: number;
    scope: PackageLimit;
    recipient: string;
    expiresAt: number;
}

export function activePackageLimit(
    notices: PackageLimitNotice[], packageId: number, recipient: string, now = Date.now()
): PackageLimit | null {
    const matches = notices.filter(notice => notice.packageId === packageId
        && notice.expiresAt > now
        && (notice.scope === "global" || notice.recipient === recipient.trim().toLowerCase()));
    return matches.some(notice => notice.scope === "global") ? "global" : matches[0]?.scope ?? null;
}

export const packageLimitMessage = (limit: PackageLimit): string => limit === "global"
    ? "This package has reached its global purchase limit."
    : "This player has reached the purchase limit for this package.";
