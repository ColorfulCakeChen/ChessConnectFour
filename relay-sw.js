importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

const sourceMeta = {
  origin:         "https://cdn.jsdelivr.net",
  pathFolderName: "/gh/ColorfulCakeChen/ChessConnectFour",
  version:        "0.1"
};

/**
 *
 * @return Array The file names prefixed with sourceMeta.
 */
function produceSourceFileList(sourceMeta, fileNames) {
  let result = new Array(fileNames.length);
  let i = 0;
  for (let fileName of fileNames) {
    result[i] = sourceMeta.origin + sourceMeta.pathFolderName + "@" + sourceMeta.version + fileName;
    ++i;
  }
  return result;
}

/**
 *
 * @return Array The URL list.
 */
function urlManipulator({url}) {
  let result = [url];  // ...unfinished..
  return result;
}

let precacheFileNames = produceSourceFileList(sourceMeta, [
  "/index.html"
]);

workbox.precaching.precacheAndRoute(
  precacheFileNames,
  {
    urlManipulation: urlManipulator
  }
);
