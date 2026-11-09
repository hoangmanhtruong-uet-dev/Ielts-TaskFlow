import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";

function loadEnv() {
  const content = fs.readFileSync(".env.local", "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    }
  }
}

loadEnv();

async function testUpload() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  console.log("Config:", {
    accountId,
    accessKeyId,
    bucketName,
    hasSecret: !!secretAccessKey,
  });

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
    forcePathStyle: true,
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: "test-file.txt",
    ContentType: "text/plain",
  });

  try {
    const url = await getSignedUrl(client, command, { expiresIn: 300 });
    console.log("Generated URL:", url);

    // Now try fetching it
    const res = await fetch(url, {
      method: "PUT",
      body: "Hello from test",
      headers: { "Content-Type": "text/plain" },
    });

    console.log("Fetch status:", res.status, res.statusText);
    if (!res.ok) {
      console.error(await res.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testUpload();
