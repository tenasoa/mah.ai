import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill for text encoder/decoder if needed (often needed for jsdom)
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

// Make sure we can use 'jest' syntax if we really want to, but we should prefer 'vi'
// This helps with migration if we have old tests
(global as any).jest = vi;
