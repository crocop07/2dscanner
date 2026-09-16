// lib/parse.ts

export interface Parsed2DData {
    raw: string;
    length: number;
    isValid220: boolean;
    upuCountryId: string;
    informationTypeId: string;
    versionId: string;
    barcodeId: string;
    barcodeIdType: string;
    sendingObiId: string;
    sendingFunctionalLocationId: string;
    prioritySpecification: string;
    dateOfProduction: string;
    indexIdMcsl: string;
    processingFunction: string;
    receivingOffice1: string;
    receivingOffice2: string;
    dispatchingOffice: string;
    hubName: string;
    laneCode: string;
    trackedCode: string;
    hubCode: string;
    localSegCode: string;
    content: string;
    route1: string;
    route2: string;
    reorderBarcodeCode1D: string;
    customAttribute1: string;
    customAttribute2: string;
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

    // Normalize payload: convert hardware scanner dots/control characters to standard spaces
    const normalizedPayload = payload.replace(/\./g, " ");

    const length = payload.length;
    const isValid220 = length === 220;

    return {
        raw: normalizedPayload,
        length,
        isValid220,
        upuCountryId: normalizedPayload.substring(0, 4),
        informationTypeId: normalizedPayload.substring(4, 5),
        versionId: normalizedPayload.substring(5, 6),
        barcodeId: normalizedPayload.substring(6, 19),
        barcodeIdType: normalizedPayload.substring(19, 21),
        sendingObiId: normalizedPayload.substring(21, 27),
        sendingFunctionalLocationId: normalizedPayload.substring(27, 36),
        prioritySpecification: normalizedPayload.substring(36, 37),
        dateOfProduction: normalizedPayload.substring(37, 45),
        indexIdMcsl: normalizedPayload.substring(45, 58), // MCSL / DOSL offset
        processingFunction: normalizedPayload.substring(58, 59),
        receivingOffice1: normalizedPayload.substring(59, 74),
        receivingOffice2: normalizedPayload.substring(74, 92),
        dispatchingOffice: normalizedPayload.substring(92, 102),
        hubName: normalizedPayload.substring(102, 107),
        laneCode: normalizedPayload.substring(107, 110),
        trackedCode: normalizedPayload.substring(110, 114),
        hubCode: normalizedPayload.substring(114, 117),
        localSegCode: normalizedPayload.substring(117, 123),
        content: normalizedPayload.substring(123, 138),
        route1: normalizedPayload.substring(138, 164),
        route2: normalizedPayload.substring(164, 190),
        reorderBarcodeCode1D: normalizedPayload.substring(190, 195),
        customAttribute1: normalizedPayload.substring(195, 205),
        customAttribute2: normalizedPayload.substring(205, 220),
    };
}