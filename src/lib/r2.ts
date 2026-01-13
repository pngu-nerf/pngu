/**
 * PNGU R2 Manager (SDK-Less Version)
 * Bypasses AWS SDK to avoid "DOMParser is not defined" errors.
 */

export async function getR2Data(folderPrefix: string) {
  const BUCKET_NAME = "pngu-assets";
  // The Public S3 API endpoint for your bucket
  const url = `https://3f9488bac1783599afb7ea3af1654150.r2.cloudflarestorage.com/${BUCKET_NAME}?prefix=${folderPrefix}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`R2 HTTP Error: ${response.status}`);
    
    const xmlText = await response.text();

    // Look for <Key>filename</Key> patterns in the XML response
    const matches = [...xmlText.matchAll(/<Key>(.*?)<\/Key>/g)];
    const filenames = matches.map(m => m[1]);

    const projectMap: Record<string, any> = {};

    filenames.forEach((key) => {
      const relativeKey = key.replace(folderPrefix, "");
      const parts = relativeKey.split("/");
      
      // We need a folder and a filename: ["Subfolder", "File.ext"]
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
    console.error("[R2 FETCH ERROR]:", error);
    return [];
  }
}
