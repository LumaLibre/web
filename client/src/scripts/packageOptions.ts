import {PackageOption, StorePackage} from "@/scripts/model/Tebex.ts";

export function requiredOptions(storePackage: StorePackage): PackageOption[] {
    return (storePackage.options ?? []).filter(option => option.required);
}

export function hasRequiredOptions(storePackage: StorePackage): boolean {
    return requiredOptions(storePackage).length > 0;
}

/**
 * @returns An error message, or null when the value is acceptable.
 */
export function validateOption(option: PackageOption, value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return "This is required.";
    }
    if (option.type === "discord_id" && !/^\d{17,20}$/.test(trimmed)) {
        return "That doesn't look like a Discord ID. Enable Developer Mode in Discord, then right-click your name and choose Copy User ID.";
    }
    return null;
}

export function optionLabel(option: PackageOption): string {
    if (option.type === "discord_id") {
        return "Discord ID";
    }
    return option.name.replace(/_/g, " ");
}
