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

export interface PackageLabel {
    name: string;
    prefix: string | null;
}

export function packageLabel(name: string): PackageLabel {
    const match = name.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (!match) {
        return {name, prefix: null};
    }

    return {name: match[2].trim(), prefix: match[1].trim()};
}

interface Variant {
    prefix: string;
    quantity: number;
    base: string;
}

function rankUpgradeTarget(name: string): string | null {
    const match = name.match(/^.+?\s*(?:»|→|->)\s*(.+?)\s+Rank\s+Upgrade$/i);
    return match ? `${match[1].trim()} Rank`.toLowerCase() : null;
}

function packageGroup(
    key: string,
    name: string,
    prefix: string | null,
    packages: StorePackage[]
): PackageGroup {
    return {
        key,
        name,
        prefix,
        packages,
        cheapest: packages.reduce((min, pkg) =>
            pkg.total_price < min.total_price ? pkg : min, packages[0])
    };
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
 * Collapses quantity variants ("1x/5x/10x Azure Crate Key") and places each
 * full rank in front of upgrade packages targeting that rank.
 * @returns Grid entries in the original package order.
 */
export function buildStoreEntries(packages: StorePackage[]): StoreEntry[] {
    const variants = new Map<string, { variant: Variant, pkg: StorePackage }[]>();
    const rankUpgrades = new Map<string, StorePackage[]>();

    for (const pkg of packages) {
        const target = rankUpgradeTarget(pkg.name);
        if (target) {
            const upgrades = rankUpgrades.get(target);
            if (upgrades) {
                upgrades.push(pkg);
            } else {
                rankUpgrades.set(target, [pkg]);
            }
        }

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

    const rankGroups = new Map<number, PackageGroup>();
    for (const pkg of packages) {
        const upgrades = rankUpgrades.get(pkg.name.toLowerCase());
        if (!upgrades || !/^.+\s+Rank$/i.test(pkg.name)) {
            continue;
        }

        const group = packageGroup(
            `rank-${pkg.id}`,
            pkg.name,
            null,
            [pkg, ...upgrades]
        );
        group.packages.forEach(member => rankGroups.set(member.id, group));
    }

    const entries: StoreEntry[] = [];
    const consumed = new Set<number>();

    for (const pkg of packages) {
        if (consumed.has(pkg.id)) {
            continue;
        }

        const rankGroup = rankGroups.get(pkg.id);
        if (rankGroup) {
            rankGroup.packages.forEach(member => consumed.add(member.id));
            entries.push({type: "group", group: rankGroup});
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
            group: packageGroup(
                variant.base.toLowerCase(),
                variant.base,
                prefixes.size === 1 ? [...prefixes][0] : null,
                sortedPackages
            )
        });
    }

    return entries;
}
