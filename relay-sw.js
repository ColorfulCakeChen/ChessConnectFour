importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

class SourceMeta {
  constructor(origin, pathFolderName, version) {
    this.origin = origin;
    this.pathFolderName = pathFolderName;
    this.version = version;
  }

  get pathFolderVersionName() {
    return this.pathFolderName + "@" + this.version;
  }

  get originPathFolderVersionName() {
    return this.origin + this.pathFolderVersionName;
  }

  /** @return string Origin + pathFolderVersionName + slashPathFileName. */
  prepend(slashPathFileName) {
    return this.originPathFolderVersionName + slashPathFileName;
  }

  /** @return Array The file names prefixed with prepend(). */
  prependList(slashPathFileNames) {
    let result = new Array(slashPathFileNames.length);
    let originPathFolderVersionName = this.originPathFolderVersionName;
    let i = 0;
    for (let slashPathFileName of slashPathFileNames) {
      result[i] = originPathFolderVersionName + slashPathFileName;
      ++i;
    }
    return result;
  }
}

const sourceMeta = new SourceMeta(
  "https://cdn.jsdelivr.net",
  "/gh/ColorfulCakeChen/ChessConnectFour",
  "0.1"
);

/**
 *
 * @return Array The URL list.
 */
function urlManipulator({url}) {
  let result = [new URL(sourceMeta.prepend(url))];
  return result;
}

//workbox.core.setCacheNameDetails({
//});

let precacheFileNames = sourceMeta.prependList([
  "/index.html",
  "_config.yml",
]);

workbox.precaching.precacheAndRoute(
  precacheFileNames,
  {
    urlManipulation: urlManipulator
  }
);
