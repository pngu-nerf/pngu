import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

/**
 * Universal R2 Manager
 * This file handles all communication with Cloudflare R2.
 * It groups files into 'projects' based on subfolders automatically.
 */

// Initialize the S3 Client for Cloudflare R2
// Note: Credentials must be set in Cloudflare Pages 'Build time' variables.
const s3 = new S3Client({
  region: "auto",
  endpoint: "https://3f9488bac1783599afb7ea3af1654150.r2.cloudflarestorage.com",
  credentials: {
    // Try both standard environment and Astro's environment loader
    accessKeyId: process.env.R2_ACCESS_KEY_ID || import.meta.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || import.meta.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = "pngu-assets";

/**
 * Fetches objects from a specific R2 folder and groups them by their subdirectories.
 * @param folderPrefix The top-level folder to scan (e.g., "PNGU-Blaster-Data-main/")
 */
export async function getR2Data(folderPrefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folderPrefix,
    });

    const response = await s3.send(command);
    const files = response.Contents || [];
    
    // This object will temporarily store our grouped projects
    const projectMap: Record<string, { displayName: string; folderName: string; files: string[] }> = {};

    files.forEach((file) => {
      // Remove the root folder name to work with the relative path
      const relativeKey = file.Key?.replace(folderPrefix, "") || "";
      const parts = relativeKey.split("/");
      
      // Filter: We only want files that are inside a subfolder
      // Expecting: [SubfolderName, FileName]
      if (parts.length < 2 || !parts[1]) return;

      const folderName = parts[0];
      const fileName = parts[1];

      if (!projectMap[folderName]) {
        projectMap[folderName] = {
          // Clean up folder names for the UI (e.g., "!Templates" -> "!Templates")
          displayName: decodeURIComponent(folderName).replace(/%20/g, " "),
          folderName: folderName,
          files: [],
        };
      }
      
      projectMap[folderName].files.push(fileName);
    });

    // Convert the map into a clean array for Astro to loop through
    return Object.values(projectMap);

  } catch (error) {
    // This logs to your Cloudflare Build console
    console.error(`[R2 UTILITY ERROR] Failed fetching prefix: ${folderPrefix}`, error);
    return [];
  }
}
