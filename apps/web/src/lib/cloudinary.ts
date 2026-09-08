import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// We keep the file name 'cloudinary.ts' and function name 'uploadToCloudinary' 
// to avoid breaking 10+ imports across the app, but internally it uses MinIO.

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadminpassword",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "sim-alfida";

export async function uploadToCloudinary(fileBuffer: Buffer, folder: string, filename: string): Promise<string> {
  const fullPath = `${folder}/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fullPath,
    Body: fileBuffer,
    ContentType: "application/octet-stream", // Fallback, could be more specific
  });

  await s3Client.send(command);

  // Return the public URL for the file
  const endpoint = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || "http://localhost:9000";
  return `${endpoint}/${BUCKET_NAME}/${fullPath}`;
}
