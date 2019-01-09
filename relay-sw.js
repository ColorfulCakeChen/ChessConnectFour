importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

class SourceMeta {
  constructor(clientOriginPathFolderName, sourceOriginPathFolderName, version) {
    this.clientOriginPathFolderName = clientOriginPathFolderName;
    this.sourceOriginPathFolderName = sourceOriginPathFolderName;
    this.version = version;

    this.sourceOriginPathFolderVersionName = this.sourceOriginPathFolderName + "@" + this.version;
  }

  /** @return {string} sourceOriginPathFolderVersionName + slashPathFileName. */
  prepend(slashPathFileName) {
    return this.sourceOriginPathFolderVersionName + slashPathFileName;
  }

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

  /** @return {string} Replace clientOriginPathFileName by sourceOriginPathFolderVersionName. */
  replaceClientBySource(pathFileName) {
    return pathFileName.replace(this.clientOriginPathFolderName, this.sourceOriginPathFolderVersionName);
  }
}

const sourceMeta = new SourceMeta(
  "https://colorfulcakechen.github.io/ChessConnectFour",
  "https://cdn.jsdelivr.net/gh/ColorfulCakeChen/ChessConnectFour",
  "0.13"
);

/**
 *
 * @return {Array} The URL list.
 */
function urlManipulator({url}) {
  let newURLString = sourceMeta.replaceClientBySource(url.href);
  let newURL = new URL(newURLString);
  let result = [newURL];
  console.log(`Convert "${url}" to "${newURL.href}"`);
  return result;
}

workbox.core.setCacheNameDetails({
  prefix: "ConnectChessFour",
  suffix: sourceMeta.version
//  precache: ,
//  runtime: ,
//  googleAnalytics:
});

let precacheFileNames = sourceMeta.prependList([
  "/index.html",
  "/relay-sw.js",  // !!
  "/_config.yml",
  "/_includes/nested.html",
]);

workbox.precaching.precacheAndRoute(
  precacheFileNames,
  {
    urlManipulation: urlManipulator
  }
);
