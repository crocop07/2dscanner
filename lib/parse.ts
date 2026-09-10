// lib/parse.ts

export interface Parsed2DData {
    raw: string;
    length: number;
    isValid220: boolean;
    formatClass: string;
    postcodeDPS: string;
    itemId: string;
}

/**
 * Validates whether a scanned string meets the standard 220-character requirement.
 * @param payload - The complete text string returned by the scanner, not the 2D code's internal payload.
 */
export function validate2DCodeLength(payload: string): boolean {
    return payload.length === 220;
}

/**
 * Extracts distinct payload chunks using character offsets.
 * or returns N/A
 */
export function parse2DCodePayload(payload: string): Parsed2DData {

    const length = payload.length;
    const isValid220 = length === 220;

    return {
        raw: payload,
        length,
        isValid220,
        formatClass: payload.substring(0, 15) || "N/A",
        postcodeDPS: payload.substring(15, 27) || "N/A",
        itemId: payload.substring(27, 40) || "N/A",
    };
}