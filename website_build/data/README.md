# Data for Sustain Care Website

The code and files in here are used by '[11ty](https://www.11ty.dev)' to generate the static html
for the various care initiatives.

The files in here will be available to the templates at build time.

You will need to make a secrets.js file here in order to use this code... but don't check in your secrets to your repo! Your file should look like this:

```js
// Stuff that should not be checked into github
module.exports = {
  // The url for the Google Sheets; it should have "/pub?output=csv" on the end for this to work properly
  initiatives_data_source:
    'https://docs.google.com/spreadsheets/d/e/{__!!BIG_HAIRY_GUID_HERE!!__}/pub?output=csv',
  // read about how to get one here: https://support.google.com/googleapi/answer/6158862?hl=en&ref_topic=7013279
  google_api_key: 'NASTY_NUMBER_HERE',
};
```
