import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

test('running build twice leaves git worktree clean', () => {
  const before = execSync('git status --porcelain').toString().trim();
  execSync('node scripts/update-version.mjs');
  const after = execSync('git status --porcelain').toString().trim();
  expect(after).toBe(before);
});

test('build updates files for prerelease versions', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'update-version-'));
  fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
  fs.cpSync('scripts/update-version.mjs', path.join(tmp, 'scripts', 'update-version.mjs'));
  fs.cpSync('index.html', path.join(tmp, 'index.html'));
  fs.cpSync('manifest.json', path.join(tmp, 'manifest.json'));
  fs.cpSync('version.js', path.join(tmp, 'version.js'));
  fs.cpSync('version.global.js', path.join(tmp, 'version.global.js'));

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const prerelease = '2.0.0-beta.1';
  pkg.version = prerelease;
  fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  execSync('node scripts/update-version.mjs', { cwd: tmp });

  const html = fs.readFileSync(path.join(tmp, 'index.html'), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  expect(doc.querySelector('#start-version').textContent).toBe(`v${prerelease}`);
  expect(doc.querySelector('#version-pill').textContent).toBe(`v${prerelease}`);
  expect(doc.querySelector('link[rel="stylesheet"]').getAttribute('href')).toBe(`style.css?v=${prerelease}`);
  expect(
    doc
      .querySelector('script[type="module"][src^="version.global.js"]')
      .getAttribute('src')
  ).toBe(`version.global.js?v=${prerelease}`);
  expect(
    doc
      .querySelector('script[type="module"][src^="main.js"]')
      .getAttribute('src')
  ).toBe(`main.js?v=${prerelease}`);
  expect(doc.querySelector('link[rel="manifest"]').getAttribute('href')).toBe(`manifest.json?v=${prerelease}`);

  const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'manifest.json'), 'utf8'));
  expect(manifest.version).toBe(prerelease);
  const versionJs = fs
    .readFileSync(path.join(tmp, 'version.js'), 'utf8')
    .trim()
    .split('\n');
  expect(versionJs).toEqual([
    `export const RELEASE_VERSION = '${prerelease}';`,
    "export const BUILD_NUMBER    = '';",
    "export const GIT_SHA         = 'devsha';",
  ]);
  const versionGlobal = fs
    .readFileSync(path.join(tmp, 'version.global.js'), 'utf8')
    .trim()
    .split('\n');
  expect(versionGlobal).toEqual([
    "import { RELEASE_VERSION, BUILD_NUMBER, GIT_SHA } from './version.js';",
    '',
    "if (typeof window !== 'undefined') {",
    "  window.__APP_VERSION__ = 'v' + RELEASE_VERSION;",
    '  const meta = [];',
    '  if (BUILD_NUMBER) meta.push(BUILD_NUMBER);',
    '  if (GIT_SHA) meta.push(GIT_SHA);',
    "  window.__APP_BUILD_META__ = meta.length ? `build.${meta.join('.')}` : '';",
    '}',
  ]);
});

