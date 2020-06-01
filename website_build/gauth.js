const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// this all comes from the quickstart docs here:
// https://developers.google.com/drive/api/v3/quickstart/nodejs
// you will need to follow the first bits of that tutorial to turn on access in your account
// this script will use YOUR google credentials to get permission to access urls...
// and will make a credentials.json file
//
// this happens in an elaborate OAuth song-n-dance that involves a browser where you can
// log into google. It will warn you that the operation is unsafe; this is because the "app"
// that you registered isn't known to be yours, and is a"quickstart" sort of thing. This
// is to protect OTHER users, say if we published this code on a webpage somewhere, we wouldn't
// want it to have access to a person's GDrive without full warning.
//
// tl;dr: don't share credentials.json / token.json with anyone,
// and don't use this code in any sort of public way

// running this should dump a token.json file in the current directory.
// a key in there will be used by the gdrive.js functions to download stuff from gdrive.
// hackety, but working for now.

// YOU HAVE TO RUN THIS BY HAND; eleventy won't do it for you. Once token.json is there,
// eleventy can run

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
  });
}

// /**
//  * Lists the names and IDs of up to 10 files.
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// function listFiles(auth) {
//   const drive = google.drive({ version: 'v3', auth });
//   drive.files.list(
//     {
//       pageSize: 10,
//       fields: 'nextPageToken, files(id, name)',
//     },
//     (err, res) => {
//       if (err) return console.log(`The API returned an error: ${err}`);
//       const { files } = res.data;
//       if (files.length) {
//         console.log('Files:');
//         files.map(file => {
//           console.log(`${file.name} (${file.id})`);
//         });
//       } else {
//         console.log('No files found.');
//       }
//     }
//   );
// }

// function getFileData(auth) {
//   const drive = google.drive({ version: 'v3', auth });
//   const fields =
//     'name, hasThumbnail, thumbnailLink, webContentLink, originalFilename, fileExtension, imageMediaMetadata, size';
//   const fileId = '1hcUeZkdNlFsNRuRXS5odKL_g5zW4F3ya';
//   drive.files.get({ fileId, fields }, (err, res) => {
//     if (err) return console.log(`The API returned an error: ${err}`);
//     // const { d } = res.data;
//     console.log(JSON.stringify(res.data, null, 2));
//   });
// }

// function downloadFile(auth) {
//   const drive = google.drive({ version: 'v3', auth });
//   const fileId = '1hcUeZkdNlFsNRuRXS5odKL_g5zW4F3ya';
//   const dest = fs.createWriteStream('/tmp/download.file');
//   drive.files.get({ fileId, alt: 'media' }, (err, res) => {
//     if (err) {
//       return console.log(`The API returned an error: ${err}`);
//     }
//     dest.write(res.data);
//     res.data = null; // clear this out so as to not write 3Mb of junk to console
//     console.log(JSON.stringify(res, null, 2));
//   });
// }

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content));
  console.log('Token.json seems to be alread there.');
});
