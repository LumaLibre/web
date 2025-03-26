export function getRandomElement<T>(list: T[]): T {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

export const INVIS_CHAR = (amt: number) => "\u00A0".repeat(amt);
export const INVIS_BORDER = (str: string, amt: number) =>
    `${INVIS_CHAR(amt)}${str}${INVIS_CHAR(amt)}`;