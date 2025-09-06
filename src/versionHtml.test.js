import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import { RELEASE_VERSION } from '../version.js';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let JSDOM;
beforeAll(async () => {
  ({ JSDOM } = await import('jsdom'));
});

test('index.html uses release version in query params and badges', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.querySelector('#start-version').textContent).toBe(`v${RELEASE_VERSION}`);
  expect(doc.querySelector('#version-pill').textContent).toBe(`v${RELEASE_VERSION}`);
  expect(doc.querySelector('link[rel="stylesheet"]').getAttribute('href')).toBe(`style.css?v=${RELEASE_VERSION}`);
  expect(
    doc
      .querySelector('script[type="module"][src^="version.global.js"]')
      .getAttribute('src')
  ).toBe(`version.global.js?v=${RELEASE_VERSION}`);
  expect(
    doc
      .querySelector('script[type="module"][src^="main.js"]')
      .getAttribute('src')
  ).toBe(`main.js?v=${RELEASE_VERSION}`);
  expect(doc.querySelector('link[rel="manifest"]').getAttribute('href')).toBe(`manifest.json?v=${RELEASE_VERSION}`);
  expect(doc.querySelector('#stage')).not.toBeNull();
  expect(doc.querySelector('#hud')).not.toBeNull();
});
