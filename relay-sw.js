importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

const sourceVersion = "0.17";

/**
 * Route GuiHub Pages to jsdelivr (with a specific version tag).
 */
class RouteFromGitHubPagesToJsDelivr {

  constructor(version) {
    this.version = version;

    this.replacePatternGitHubPages = /^https:\/\/([^.]+)\.github\.io\/([^/]+)/; // e.g. https://colorfulcakechen.github.io/ChessConnectFour
    this.replaceContextJsdelivr = "https://cdn.jsdelivr.net/gh/$1/$2";          // e.g. https://cdn.jsdelivr.net/gh/ColorfulCakeChen/ChessConnectFour
    if (this.version)
      this.replaceContextJsdelivr += "@" + this.version;                        // e.g. https://cdn.jsdelivr.net/gh/ColorfulCakeChen/ChessConnectFour@0.16
  }

  /**
   * @param  {Request} request The original request.
   * @return {Request} If GitHub Pages, return jsdrlivr request. Otherwise, the original request.
   */
  async determineRequest(request) {
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

//!!!
//      // Use default "follow" (i.e. can not be "manual") so that inside iframe can also be loaded automatically.
      redirect: request.redirect,

      integrity: request.integrity,
    };
    let newRequest = new Request(newURL, newInit);

    return newRequest;  // Redirect to different URL.
  }

  /**
   * @param  {Response} response The original response.
   * @return {Response} If .html file with MIME type text/plain, return text/html response. Otherwise, the original response.
   */
  determineResponse(response) {
    let matchResult = response.url.match(/.html$/i);
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

  /**
   * The matching callback of Workbox's route.
   * @param {URL} context.url
   */
  matchCb({url, event}) {
    return (url.href.match(this.replacePatternGitHubPages));
  }

  /**
   * The handler callback of Workbox's route.
   */
  async handlerCb({url, event, params}) {
    let request = await this.determineRequest(event.request);
    let response = await fetch(request);
    response = this.determineResponse(response);
    return response;
  }
}

let route = new RouteFromGitHubPagesToJsDelivr(sourceVersion);

let matchCb = route.matchCb.bind(route);
let handlerCb = route.handlerCb.bind(route);

workbox.routing.registerRoute(matchCb, handlerCb);
