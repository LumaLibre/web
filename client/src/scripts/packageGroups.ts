import {StoreCategory, StorePackage} from "@/scripts/model/Tebex.ts";

export function categorySlug(category: StoreCategory): string {
    if (category.slug) {
        return category.slug;
    }
    return category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export interface PackageGroup {
    key: string;
    name: string;
    prefix: string | null;
    packages: StorePackage[];
    cheapest: StorePackage;
}

export type StoreEntry =
    | { type: "package", package: StorePackage }
    | { type: "group", group: PackageGroup };

interface Variant {
    prefix: string;
    quantity: number;
    base: string;
}

// Discount notes are stripped for matching; meaningful ones like "(1h)" are kept.
function parseVariant(name: string): Variant | null {
    const match = name.match(/^(.*?)(\d+)\s*x\s+(.+)$/i);
    if (!match) {
        return null;
    }

    const [, prefix, quantity, remainder] = match;
    const base = remainder
        .replace(/\s*\([^)]*(?:%|off|discount|ea\.?)[^)]*\)\s*$/i, "")
        .trim();

    if (!base) {
        return null;
    }

    const cleanPrefix = prefix.trim().replace(/[-–—:|]+$/, "").trim();

    return {prefix: cleanPrefix, quantity: Number(quantity), base};
}

/**
 * Collapses quantity variants ("1x/5x/10x Azure Crate Key") into a single group.
 * @returns Grid entries in the original package order.
 */
export function buildStoreEntries(packages: StorePackage[]): StoreEntry[] {
    const variants = new Map<string, { variant: Variant, pkg: StorePackage }[]>();

    for (const pkg of packages) {
        const variant = parseVariant(pkg.name);
        if (!variant) {
            continue;
        }
        const key = variant.base.toLowerCase();
        const bucket = variants.get(key);
        if (bucket) {
            bucket.push({variant, pkg});
        } else {
            variants.set(key, [{variant, pkg}]);
        }
    }

    const entries: StoreEntry[] = [];
    const consumed = new Set<number>();

    for (const pkg of packages) {
        if (consumed.has(pkg.id)) {
            continue;
        }

        const variant = parseVariant(pkg.name);
        const bucket = variant ? variants.get(variant.base.toLowerCase()) : undefined;

        if (!variant || !bucket || bucket.length < 2) {
            entries.push({type: "package", package: pkg});
            continue;
        }

        const members = [...bucket].sort((a, b) => a.variant.quantity - b.variant.quantity);
        members.forEach(member => consumed.add(member.pkg.id));

        const prefixes = new Set(members.map(m => m.variant.prefix).filter(Boolean));
        const sortedPackages = members.map(m => m.pkg);

        entries.push({
            type: "group",
            group: {
                key: variant.base.toLowerCase(),
                name: variant.base,
                prefix: prefixes.size === 1 ? [...prefixes][0] : null,
                packages: sortedPackages,
                cheapest: sortedPackages.reduce((min, p) =>
                    p.total_price < min.total_price ? p : min, sortedPackages[0])
            }
        });
    }

    return entries;
}
