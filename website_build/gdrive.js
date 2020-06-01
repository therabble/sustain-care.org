const fs = require('fs');
const path = require('path');

const { URL } = require('url');

const fetch = require('node-fetch');

// get the auth bit we need...
const { access_token } = JSON.parse(fs.readFileSync('token.json'));

function getIdFromURL(urlstr) {
  const u = new URL(urlstr);
  return u.searchParams.get('id');
}

async function getImageMetadata(id) {
  // 'id' which we can use to grab metadata from google

  const url = new URL(`https://www.googleapis.com/drive/v3/files/${id}`);
  // other possible fields are:
  // 'name, mimeType, hasThumbnail, thumbnailLink, webContentLink, originalFilename, fileExtension, imageMediaMetadata, size'
  url.searchParams.set(
    'fields',
    'originalFilename, mimeType, imageMediaMetadata, size, fileExtension'
  );
  const headers = { headers: { Authorization: `Bearer ${access_token}` } };

  const response = await fetch(url.href, headers);
  const data = await response.json();
  return data;
}

async function downloadImage(id, filename, savedir) {
  // make sure the save target exists
  if (!fs.existsSync(savedir)) fs.mkdirSync(savedir);
  const newFile = fs.createWriteStream(path.join(savedir, filename));
  // download url now
  const headers = { headers: { Authorization: `Bearer ${access_token}` } };
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${id}`);
  url.searchParams.set('alt', 'media');

  // !! no error handling anywhere...
  const response = await fetch(url.href, headers);
  const body = await response.body;
  body.pipe(newFile);
  console.log(`Saved file '${path.join(savedir, filename)}'`);
}

module.exports = {
  downloadImage,
  getIdFromURL,
  getImageMetadata,
};
