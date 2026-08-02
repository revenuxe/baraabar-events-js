import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3PublicUrl } from "./s3-url";

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

let _client: S3Client | undefined;

function client() {
  if (!BUCKET || !REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      "S3 is not configured — set AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
    );
  }
  if (!_client) {
    _client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

/** A short-lived URL the browser can PUT the file to directly — the file
 * never passes through our server, avoiding serverless request-body limits. */
export async function presignUpload(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 60 });
  return { uploadUrl, publicUrl: s3PublicUrl(key) };
}

export async function deleteS3Object(key: string) {
  await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
