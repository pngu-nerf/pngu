import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Initialize the R2 Client
// This uses the credentials you set in the Cloudflare Pages Dashboard
const s3 = new S3Client({
  region: "auto",
  endpoint: "https://3f9488bac1783599afb7ea3af1654150.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || import.meta.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || import.meta.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = "pngu-assets";

export async function getR2Data(folderPrefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folderPrefix,
    });

    const response = await s3.send(command);
    const files = response.Contents || [];
    const projectMap: Record<string, any> = {};

    files.forEach((file) => {
      const relativeKey = file.Key?.replace(folderPrefix, "") || "";
      const parts = relativeKey.split("/");
      
      // We expect: ["Folder Name", "File Name"]
      if (parts.length < 2 || !parts[1]) return;

      const folderName = parts[0];
      const fileName = parts[1];

      if (!projectMap[folderName]) {
        projectMap[folderName] = {
          displayName: decodeURIComponent(folderName).replace(/%20/g, " "),
          folderName: folderName,
          files: [],
        };
      }
      projectMap[folderName].files.push(fileName);
    });

    return Object.values(projectMap);
  } catch (error) {
    // This will appear in your Cloudflare Build logs if the "keys" are wrong
    console.error(`[R2 SDK ERROR] Prefix: ${folderPrefix}`, error);
    return [];
  }
}
