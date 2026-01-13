import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://3f9488bac1783599afb7ea3af1654150.r2.cloudflarestorage.com",
  credentials: {
    // These must be set in your Cloudflare Pages Dashboard (Settings > Variables)
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function getR2Data(folderPrefix: string) {
  const BUCKET_NAME = "pngu-assets";

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
      
      // We need a subfolder and a filename
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
    console.error("[R2 SDK ERROR]:", error);
    return [];
  }
}
