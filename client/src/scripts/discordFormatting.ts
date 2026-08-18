const DISCORD_TIMESTAMP_PATTERN = /<t:(-?\d+)(?::([tTdDfFR]))?>/g;

type DiscordTimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

const DATE_TIME_FORMATS: Record<Exclude<DiscordTimestampStyle, "R">, Intl.DateTimeFormatOptions> = {
    t: {hour: "numeric", minute: "2-digit"},
    T: {hour: "numeric", minute: "2-digit", second: "2-digit"},
    d: {year: "numeric", month: "numeric", day: "numeric"},
    D: {year: "numeric", month: "long", day: "numeric"},
    f: {year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"},
    F: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }
};

function formatRelativeTimestamp(date: Date, now: Date): string {
    const seconds = (date.getTime() - now.getTime()) / 1000;
    const absoluteSeconds = Math.abs(seconds);

    let value: number;
    let unit: Intl.RelativeTimeFormatUnit;

    if (absoluteSeconds < 60) {
        value = seconds;
        unit = "second";
    } else if (absoluteSeconds < 60 * 60) {
        value = seconds / 60;
        unit = "minute";
    } else if (absoluteSeconds < 60 * 60 * 24) {
        value = seconds / (60 * 60);
        unit = "hour";
    } else if (absoluteSeconds < 60 * 60 * 24 * 30) {
        value = seconds / (60 * 60 * 24);
        unit = "day";
    } else if (absoluteSeconds < 60 * 60 * 24 * 365) {
        value = seconds / (60 * 60 * 24 * 30);
        unit = "month";
    } else {
        value = seconds / (60 * 60 * 24 * 365);
        unit = "year";
    }

    return `**${new Intl.RelativeTimeFormat(undefined, {numeric: "auto"}).format(Math.round(value), unit)}**`;
}

export function formatDiscordTimestamps(value: string, now = new Date()): string {
    return value.replace(
        DISCORD_TIMESTAMP_PATTERN,
        (match, unixSeconds: string, rawStyle: DiscordTimestampStyle | undefined) => {
            const date = new Date(Number(unixSeconds) * 1000);
            if (Number.isNaN(date.getTime())) {
                return match;
            }

            const style = rawStyle ?? "f";
            if (style === "R") {
                return formatRelativeTimestamp(date, now);
            }

            return `**${new Intl.DateTimeFormat(undefined, DATE_TIME_FORMATS[style]).format(date)}**`;
        }
    );
}
