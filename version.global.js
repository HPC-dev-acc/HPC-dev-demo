import { RELEASE_VERSION, BUILD_NUMBER, GIT_SHA } from './version.js';

if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = 'v' + RELEASE_VERSION;
  const meta = [];
  if (BUILD_NUMBER) meta.push(BUILD_NUMBER);
  if (GIT_SHA) meta.push(GIT_SHA);
  window.__APP_BUILD_META__ = meta.length ? `build.${meta.join('.')}` : '';
}
