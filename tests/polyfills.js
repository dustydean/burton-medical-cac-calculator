/**
 * Polyfills for Jest Test Environment
 * 
 * Provides necessary polyfills for Node.js environment to support
 * browser APIs and modules that expect browser globals.
 */

import { TextEncoder, TextDecoder } from 'util';

// Web API polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Additional polyfills for JSDOM compatibility
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}