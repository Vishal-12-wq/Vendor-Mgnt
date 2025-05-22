// gcs.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Load service account key
const storage = new Storage({
  keyFilename: path.join(__dirname, 'vendor-image-upload-7e6ed61045e5.json'),
  projectId: 'vendor-image-upload',
});

const bucket = storage.bucket('vendors-images');

module.exports = bucket;
