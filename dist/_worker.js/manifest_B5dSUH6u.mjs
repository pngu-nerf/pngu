globalThis.process ??= {}; globalThis.process.env ??= {};
import { h as decodeKey } from './chunks/astro/server_DXSO_DgQ.mjs';
import './chunks/astro-designed-error-pages_BqqXUgnk.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_CCdKkSBF.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/ubuntu/repos/pngu/","cacheDir":"file:///home/ubuntu/repos/pngu/node_modules/.astro/","outDir":"file:///home/ubuntu/repos/pngu/dist/","srcDir":"file:///home/ubuntu/repos/pngu/src/","publicDir":"file:///home/ubuntu/repos/pngu/public/","buildClientDir":"file:///home/ubuntu/repos/pngu/dist/","buildServerDir":"file:///home/ubuntu/repos/pngu/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"brand/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/brand","isIndex":false,"type":"page","pattern":"^\\/brand\\/?$","segments":[[{"content":"brand","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/brand.astro","pathname":"/brand","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"data/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/data","isIndex":true,"type":"page","pattern":"^\\/data\\/?$","segments":[[{"content":"data","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/data/index.astro","pathname":"/data","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"files/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/files","isIndex":true,"type":"page","pattern":"^\\/files\\/?$","segments":[[{"content":"files","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/files/index.astro","pathname":"/files","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lite/404/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lite/404","isIndex":false,"type":"page","pattern":"^\\/lite\\/404\\/?$","segments":[[{"content":"lite","dynamic":false,"spread":false}],[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lite/404.astro","pathname":"/lite/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lite/brand/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lite/brand","isIndex":false,"type":"page","pattern":"^\\/lite\\/brand\\/?$","segments":[[{"content":"lite","dynamic":false,"spread":false}],[{"content":"brand","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lite/brand.astro","pathname":"/lite/brand","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lite/contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lite/contact","isIndex":false,"type":"page","pattern":"^\\/lite\\/contact\\/?$","segments":[[{"content":"lite","dynamic":false,"spread":false}],[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lite/contact.astro","pathname":"/lite/contact","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lite/data/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lite/data","isIndex":false,"type":"page","pattern":"^\\/lite\\/data\\/?$","segments":[[{"content":"lite","dynamic":false,"spread":false}],[{"content":"data","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lite/data.astro","pathname":"/lite/data","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lite/files/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lite/files","isIndex":false,"type":"page","pattern":"^\\/lite\\/files\\/?$","segments":[[{"content":"lite","dynamic":false,"spread":false}],[{"content":"files","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lite/files.astro","pathname":"/lite/files","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lite/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lite","isIndex":true,"type":"page","pattern":"^\\/lite\\/?$","segments":[[{"content":"lite","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lite/index.astro","pathname":"/lite","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://pngu.info","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/ubuntu/repos/pngu/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/brand.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/data/[slug].astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/data/index.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/files/[slug].astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/files/index.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/repos/pngu/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/brand@_@astro":"pages/brand.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/data/[slug]@_@astro":"pages/data/_slug_.astro.mjs","\u0000@astro-page:src/pages/data/index@_@astro":"pages/data.astro.mjs","\u0000@astro-page:src/pages/files/[slug]@_@astro":"pages/files/_slug_.astro.mjs","\u0000@astro-page:src/pages/files/index@_@astro":"pages/files.astro.mjs","\u0000@astro-page:src/pages/lite/404@_@astro":"pages/lite/404.astro.mjs","\u0000@astro-page:src/pages/lite/brand@_@astro":"pages/lite/brand.astro.mjs","\u0000@astro-page:src/pages/lite/contact@_@astro":"pages/lite/contact.astro.mjs","\u0000@astro-page:src/pages/lite/data@_@astro":"pages/lite/data.astro.mjs","\u0000@astro-page:src/pages/lite/files@_@astro":"pages/lite/files.astro.mjs","\u0000@astro-page:src/pages/lite/index@_@astro":"pages/lite.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_B5dSUH6u.mjs","/home/ubuntu/repos/pngu/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/home/ubuntu/repos/pngu/src/components/ContactItem.astro?astro&type=script&index=0&lang.ts":"_astro/ContactItem.astro_astro_type_script_index_0_lang.DcaveJez.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/home/ubuntu/repos/pngu/src/components/ContactItem.astro?astro&type=script&index=0&lang.ts","function r(n){const t=document.getElementById(n);t&&t.addEventListener(\"click\",()=>{const c=t.getAttribute(\"data-value\")||\"\",o=t.getAttribute(\"data-success\")||\"\",a=t.getAttribute(\"data-original\")||\"\",e=t.querySelector(\".status-label\");navigator.clipboard.writeText(c).then(()=>{e.innerText=o,e.style.color=\"#C11111\",setTimeout(()=>{e.innerText=a,e.style.color=\"\"},2e3)})})}document.querySelectorAll(\".contact-btn\").forEach(n=>r(n.id));"]],"assets":["/blog-placeholder-1.jpg","/blog-placeholder-2.jpg","/blog-placeholder-3.jpg","/blog-placeholder-4.jpg","/blog-placeholder-5.jpg","/blog-placeholder-about.jpg","/favicon.svg","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/blaster-data/Chrono Guide Master.xlsx","/fonts/JumpsWinter.woff","/fonts/atkinson-bold.woff","/fonts/atkinson-regular.woff","/site-assets/Site Banner Old.jpg","/site-assets/banner.png","/brand-assets/Background.jpg","/brand-assets/Jumps Winter.otf","/brand-assets/Jumps Winter.ttf","/brand-assets/PNGU-logo-black.svg","/brand-assets/PNGU-logo-white.svg","/brand-assets/Youtube Banner.jpg","/brand-assets/Youtube Profile.png","/_worker.js/pages/404.astro.mjs","/_worker.js/pages/brand.astro.mjs","/_worker.js/pages/contact.astro.mjs","/_worker.js/pages/data.astro.mjs","/_worker.js/pages/files.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/lite.astro.mjs","/_worker.js/chunks/MainLayout_CqwY5FLC.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_LSQAg7iI.mjs","/_worker.js/chunks/astro-designed-error-pages_BqqXUgnk.mjs","/_worker.js/chunks/astro_BCb6UJzw.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/constants_MMvQs4cq.mjs","/_worker.js/chunks/index_BgwTPuGa.mjs","/_worker.js/chunks/noop-middleware_CCdKkSBF.mjs","/_worker.js/chunks/r2_e5nhXEcc.mjs","/_worker.js/chunks/slugify_CRl7D06Y.mjs","/site-assets/Joke Images/Screenshot_20220421-071718~2.jpg","/site-assets/Joke Images/round.boys-03-04-2023-0001.jpg","/_worker.js/pages/data/_slug_.astro.mjs","/_worker.js/pages/files/_slug_.astro.mjs","/_worker.js/pages/lite/404.astro.mjs","/_worker.js/pages/lite/brand.astro.mjs","/_worker.js/pages/lite/contact.astro.mjs","/_worker.js/pages/lite/data.astro.mjs","/_worker.js/pages/lite/files.astro.mjs","/_worker.js/chunks/astro/server_DXSO_DgQ.mjs","/404.html","/brand/index.html","/contact/index.html","/data/index.html","/files/index.html","/lite/404/index.html","/lite/brand/index.html","/lite/contact/index.html","/lite/data/index.html","/lite/files/index.html","/lite/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"NgU2T84WuAyGjoTaKspUxA+0JB0MxnTY0Ye0Q+7oYfg=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
