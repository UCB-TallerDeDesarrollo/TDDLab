import { config } from 'dotenv';
config();

console.log('SETUP FILE RUNNING');
console.log('typeof document:', typeof globalThis.document);

if (typeof globalThis.document === 'undefined') {
  console.log('document is undefined, trying to initialize jsdom');
  try {
    const { JSDOM } = require('jsdom');
    console.log('JSDOM loaded:', typeof JSDOM);
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const document = dom.window.document;
    const window = dom.window as any;

    globalThis.document = document as any;
    globalThis.window = window as any;
    globalThis.navigator = window.navigator as any;
    globalThis.HTMLElement = window.HTMLElement as any;
    globalThis.HTMLBodyElement = window.HTMLBodyElement as any;
    globalThis.Node = window.Node as any;
    globalThis.Event = window.Event as any;
    globalThis.CustomEvent = window.CustomEvent as any;
    globalThis.KeyboardEvent = window.KeyboardEvent as any;
    globalThis.MouseEvent = window.MouseEvent as any;
    globalThis.Storage = window.Storage as any;
    globalThis.localStorage = window.localStorage as any;
    globalThis.sessionStorage = window.sessionStorage as any;
    globalThis.history = window.history as any;
    globalThis.location = window.location as any;
    globalThis.URL = window.URL as any;
    globalThis.URLSearchParams = window.URLSearchParams as any;
    globalThis.DOMParser = window.DOMParser as any;
    (globalThis as any).__initializedDom = true;
    console.log('jsdom initialized manually');
  } catch (e) {
    console.error('Failed to initialize jsdom:', e);
  }
} else {
  console.log('document already exists');
}
