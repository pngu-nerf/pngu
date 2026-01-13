import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Initialize the R2 Client
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
      // 1. Clean the key to get the path relative to the prefix
      const relativeKey = file.Key?.replace(folderPrefix, "") || "";
      
      // Ignore directory markers or empty strings
      if (!relativeKey || relativeKey === "/" || relativeKey === "") return;

      const parts = relativeKey.split("/");
      
      /**
       * FLEXIBLE LOGIC:
       * If parts.length > 1: It's in a subfolder (e.g., "Data/Spreadsheet.xlsx")
       * If parts.length === 1: It's a loose file (e.g., "logo.png")
       */
      const isLooseFile = parts.length === 1;
      const folderName = isLooseFile ? "." : parts[0];
      const fileName = isLooseFile ? parts[0] : parts[1];

      // 2. Initialize the group if it doesn't exist
      if (!projectMap[folderName]) {
        projectMap[folderName] = {
          // Display "." as "Root" or "General Assets" for internal logic
          displayName: folderName === "." ? "General Assets" : decodeURIComponent(folderName).replace(/%20/g, " "),
          folderName: folderName,
          files: [],
        };
      }

      // 3. Add the file to the project group
      projectMap[folderName].files.push(fileName);
    });

    // Return as array for easy mapping in Astro components
    return Object.values(projectMap);

  } catch (error) {
    console.error(`[R2 SDK ERROR] Prefix: ${folderPrefix}`, error);
    return [];
  }
}
