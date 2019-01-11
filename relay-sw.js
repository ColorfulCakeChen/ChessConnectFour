importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

const sourceVersion = "0.17";

/**
 * 
 */
class JsDelivrPlugin {

  constructor(clientOriginPathFolderName, sourceOriginPathFolderName, version) {

//!!! ...should be removed...
    this.clientOriginPathFolderName = clientOriginPathFolderName;
    this.sourceOriginPathFolderName = sourceOriginPathFolderName;

    this.version = version;

//!!! ...should be removed...
    this.sourceOriginPathFolderVersionName = this.sourceOriginPathFolderName + "@" + this.version;

    this.replacePatternGitHubPages = /^https:\/\/([^.]+)\.github\.io\/([^/]+)/; // e.g. https://colorfulcakechen.github.io/ChessConnectFour
    this.replaceContextJsdelivr = "https://cdn.jsdelivr.net/gh/$1/$2";          // e.g. https://cdn.jsdelivr.net/gh/ColorfulCakeChen/ChessConnectFour
    if (this.version)
       this.replaceContextJsdelivr += "@" + this.version;                       // e.g. https://cdn.jsdelivr.net/gh/ColorfulCakeChen/ChessConnectFour@0.16
  }

//!!! ...should be removed...
  /** @return {string} sourceOriginPathFolderVersionName + slashPathFileName. */
  prepend(slashPathFileName) {
    return this.sourceOriginPathFolderVersionName + slashPathFileName;
  }

//!!! ...should be removed...
  /** @return {Array} The file names prefixed with prepend(). */
  prependList(slashPathFileNames) {
    let result = new Array(slashPathFileNames.length);
    let sourceOriginPathFolderVersionName = this.sourceOriginPathFolderVersionName;
    let i = 0;
    for (let slashPathFileName of slashPathFileNames) {
      result[i] = sourceOriginPathFolderVersionName + slashPathFileName;
      ++i;
    }
    return result;
  }

//!!! ...should be removed...
  /** @return {string} Replace clientOriginPathFileName by sourceOriginPathFolderVersionName. */
  replaceClientBySource(pathFileName) {
    //return pathFileName.replace(this.clientOriginPathFolderName, this.sourceOriginPathFolderVersionName);
    return pathFileName.replace(this.replacePatternGitHubPages, this.replaceContextJsdelivr);
  }


  /**
   * Convert MIME type of .html file from text/plain to text/html.
   */
  async cacheWillUpdate({request, response, event}) {
    let matchResult = request.url.match(/.html$/i);
    if (!matchResult)
      return response;   // Not .html file, no need to convert.
 
    let contentTypeOld = response.headers.get("Content-Type");
    if (!contentTypeOld.match("text/plain"))
       return response;  // Already correct MIME type, no need to convert.

    let contentTypeNew = contentTypeOld.replace("text/plain", "text/html");
    let newHeaders = new Headers(response.headers);
    newHeaders.set("Content-Type", contentTypeNew);
    let newInit = { status : response.status, statusText : response.statusText, headers: newHeaders };
    let newResponse = new Response(response.body, newInit);
    return newResponse;
  }

//   async cacheDidUpdate({cacheName, request, oldResponse, newResponse, event}) {
//     // No return expected
//     // Note: `newResponse.bodyUsed` is `true` when this is called,
//     // meaning the body has already been read. If you need access to
//     // the body of the fresh response, use a technique like:
//     // const freshResponse = await caches.match(request, {cacheName});
//   }

//   async cachedResponseWillBeUsed({cacheName, request, matchOptions, cachedResponse, event}) {
//     // Return `cachedResponse`, a different Response object or null
//     return cachedResponse;
//   }

  /**
   * Replace path of GitHub Pages to jsdrlivr.
   */
  async requestWillFetch({request}) {
    let newURL = request.url.replace(this.replacePatternGitHubPages, this.replaceContextJsdelivr);
    if (request.url == newURL)
      return request;  // If no replacement, no need to redirect.

    let newHeaders = new Headers(request.headers);
    newHeaders.delete("upgrade-insecure-requests"); // Can not have this header when request.mode is "cors".

    // If the request has content type, it might have body. See also:
    // https://stackoverflow.com/questions/34640286/how-do-i-copy-a-request-object-with-a-different-url/34641566#34641566
    let body = await ( request.headers.get('Content-Type') ? request.blob() : Promise.resolve(undefined) );

    let newInit = {
      method: request.method,
      headers: newHeaders,
      body: body,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,

      // It is cross-origin to accessing jsdelivr from GitHub Page. (i.e. can not be "navigation".)
      //mode: request.mode,
      mode: "cors",

      // Because we will direct to different origin, use default "same-origin.
      // If use request.credentials and it is "include", the new request will fail.
      //credentials: request.credentials,

      cache: request.cache,

//      // Because mode is "no-cors", the redirect mode must be default "follow" (i.e. can not be "manual").
      redirect: request.redirect,

      integrity: request.integrity,
    };
    let newRequest = new Request(newURL, newInit);

    return newRequest;  // Redirect to different URL.
  }

//   async fetchDidFail({originalRequest, request, error, event}) {
//     // No return expected.
//     // NOTE: `originalRequest` is the browser's request, `request` is the
//     // request after being passed through plugins with
//     // `requestWillFetch` callbacks, and `error` is the exception that caused
//     // the underlying `fetch()` to fail.
//   }
}

const theJsDelivrPlugin = new JsDelivrPlugin(
  "https://colorfulcakechen.github.io/ChessConnectFour",
  "https://cdn.jsdelivr.net/gh/ColorfulCakeChen/ChessConnectFour",
  sourceVersion
);

/**
 *
 * @return {Array} The URL list.
 */
function urlManipulator({url}) {
  let newURLString = theJsDelivrPlugin.replaceClientBySource(url.href);
  let newURL = new URL(newURLString);
  let result = [newURL];
  console.log(`Convert "${url}" to "${newURL.href}"`);
  return result;
}

// workbox.core.setCacheNameDetails({
// //  prefix: "ConnectChessFour",
//   suffix: sourceMeta.version
// //  precache: ,
// //  runtime: ,
// //  googleAnalytics:
// });

let precacheFileNames = theJsDelivrPlugin.prependList([
  "/index.html",
  "/relay-sw.js",  // !!
  "/_config.yml",
  "/_includes/nested.html",
]);

//workbox.precaching.precacheAndRoute(
//   precacheFileNames,
//   {
//     urlManipulation: urlManipulator
//   }
// );

//workbox.precaching.precache(precacheFileNames);

workbox.routing.registerRoute(
  theJsDelivrPlugin.replacePatternGitHubPages,
//  workbox.strategies.cacheFirst({
  workbox.strategies.networkOnly({
    plugins: [
      theJsDelivrPlugin
    ]
  })
);

