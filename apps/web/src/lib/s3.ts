import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto", // Required for AWS, but ignored by MinIO
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minio_admin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minio_password",
  },
  forcePathStyle: true, // Crucial for MinIO
});

const BUCKET = process.env.S3_BUCKET || "sim-alfida-uploads";

/**
 * Generate a presigned URL for uploading a file directly to MinIO from the browser.
 */
export async function generateUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 15 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 900 });
}

/**
 * Generate a presigned URL for securely downloading/viewing a file.
 */
export async function generateDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  // URL expires in 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
