const { Storage } = require('@google-cloud/storage');

const serviceAccount = JSON.parse(process.env.GCLOUD_SERVICE_KEY);

const storage = new Storage({
  projectId: serviceAccount.project_id,
  credentials: serviceAccount,
});

const bucket = storage.bucket('vendors-images');

module.exports = bucket;
