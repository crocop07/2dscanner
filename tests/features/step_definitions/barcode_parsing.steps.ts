import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { parse2DCodePayload, Parsed2DData } from '../../../lib/parse';

let rawPayload = '';
let parsedResult: Parsed2DData | null = null;

// Helper to construct a padded mock 220-char payload
function createMockPayload(length: number, mcslCode = 'MCSL000001000'): string {
    const prefix = 'UPU111111111111111111111111111111111111111111111'; // 45 chars
    const suffixLength = Math.max(0, length - prefix.length - mcslCode.length);
    const suffix = 'X'.repeat(suffixLength);
    return (prefix + mcslCode + suffix).substring(0, length);
}