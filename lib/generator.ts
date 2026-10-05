// lib/generator.ts

const DEFAULT_MCSL = "MCSL123456789";

/**
 * Ensures the extracted or provided ID is formatted as a 13-character string 
 * with an MCSL/DOSL prefix (e.g. MCSL123456789).
 */
function formatMcslId(raw: string): string {
    const trimmed = raw.trim().toUpperCase();

    if (!trimmed) {
        return DEFAULT_MCSL;
    }

    // If already 13 chars long (e.g. directly scanned MCSL123456789 or DOSL987654321)
    if (trimmed.length === 13) {
        return trimmed;
    }

    // Handle strings starting with MCSL or DOSL
    if (trimmed.startsWith("MCSL") || trimmed.startsWith("DOSL")) {
        const prefix = trimmed.slice(0, 4);
        const numericPart = trimmed.slice(4).replace(/\D/g, "");
        return `${prefix}${numericPart.padStart(9, "0").slice(-9)}`;
    }

    // Handle numeric-only input (e.g., user types "123456")
    const numericOnly = trimmed.replace(/\D/g, "");
    return `MCSL${numericOnly.padStart(9, "0").slice(-9)}`;
}

/**
 * Embeds an MCSL/DOSL ID into a valid 220-character dummy payload.
 */
export function generateDummyPayloadWithMcsl(rawMcsl: string = ""): string {
    const mcslField = formatMcslId(rawMcsl); // Exactly 13 characters

    // Offsets 0..45 (45 chars)
    const prefix = "JGB 01000000000000000000000000000000000000000";

    // Offsets 58..220 (162 chars)
    const suffix = "0".repeat(162);

    const fullPayload = `${prefix}${mcslField}${suffix}`;

    // Strict 220-character guard
    return fullPayload.slice(0, 220).padEnd(220, "0");
}