// gcs.js
const { Storage } = require('@google-cloud/storage');

// Parse credentials JSON from env var
const gcpCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const storage = new Storage({
  projectId: gcpCredentials.project_id,
  credentials: gcpCredentials,
});

const bucket = storage.bucket('vendors-images');

module.exports = bucket;
