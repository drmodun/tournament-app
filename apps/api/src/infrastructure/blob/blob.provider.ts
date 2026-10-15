import { S3Client } from '@aws-sdk/client-s3';

// Works with AWS S3 and any S3-compatible server (SeaweedFS, Garage, MinIO, Cloudflare R2, ...).
// The older AWS_* variable names are still read as a fallback.
export const getS3Settings = () => {
  const endpoint = process.env.S3_ENDPOINT || undefined;

  return {
    // Leave unset for AWS; set to the server's URL for anything else
    endpoint,
    region: process.env.S3_REGION || process.env.AWS_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:
      process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET || process.env.AWS_S3_BUCKET,
    // Self-hosted servers address buckets as /bucket/key rather than bucket.host/key
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE
      ? process.env.S3_FORCE_PATH_STYLE === 'true'
      : !!endpoint,
  };
};

export const AwsS3Provider = {
  provide: 'AWS_S3',
  useFactory: () => {
    const settings = getS3Settings();

    if (
      !settings.region ||
      !settings.accessKeyId ||
      !settings.secretAccessKey
    ) {
      throw new Error('S3 credentials are not set');
    }

    return new S3Client({
      endpoint: settings.endpoint,
      region: settings.region,
      forcePathStyle: settings.forcePathStyle,
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    });
  },
};
