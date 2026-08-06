import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

// Server-only — holds AWS_SECRET_ACCESS_KEY, must never reach the browser
// bundle (see api/upload/route.ts and api/vendor/upload/route.ts, its callers).
export const AWS_REGION = process.env.AWS_REGION!;
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
