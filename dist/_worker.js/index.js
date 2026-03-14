globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_LSQAg7iI.mjs';
import { manifest } from './manifest_B5dSUH6u.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/404.astro.mjs');
const _page1 = () => import('./pages/brand.astro.mjs');
const _page2 = () => import('./pages/contact.astro.mjs');
const _page3 = () => import('./pages/data/_slug_.astro.mjs');
const _page4 = () => import('./pages/data.astro.mjs');
const _page5 = () => import('./pages/files/_slug_.astro.mjs');
const _page6 = () => import('./pages/files.astro.mjs');
const _page7 = () => import('./pages/lite/404.astro.mjs');
const _page8 = () => import('./pages/lite/brand.astro.mjs');
const _page9 = () => import('./pages/lite/contact.astro.mjs');
const _page10 = () => import('./pages/lite/data.astro.mjs');
const _page11 = () => import('./pages/lite/files.astro.mjs');
const _page12 = () => import('./pages/lite.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/404.astro", _page0],
    ["src/pages/brand.astro", _page1],
    ["src/pages/contact.astro", _page2],
    ["src/pages/data/[slug].astro", _page3],
    ["src/pages/data/index.astro", _page4],
    ["src/pages/files/[slug].astro", _page5],
    ["src/pages/files/index.astro", _page6],
    ["src/pages/lite/404.astro", _page7],
    ["src/pages/lite/brand.astro", _page8],
    ["src/pages/lite/contact.astro", _page9],
    ["src/pages/lite/data.astro", _page10],
    ["src/pages/lite/files.astro", _page11],
    ["src/pages/lite/index.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
