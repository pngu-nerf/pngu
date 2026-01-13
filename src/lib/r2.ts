export async function getR2Data(folderPrefix: string) {
  const BUCKET_NAME = "pngu-assets";
  
  // Use the public .dev URL or your custom assets domain to bypass S3 signing
  // Replace the URL below with your actual "Public Development URL" from the dashboard
  const publicUrl = `https://pub-805dbe440d6c45d485c1539d5ede38b1.r2.dev/?prefix=${folderPrefix}`;

  try {
    const response = await fetch(publicUrl);
    
    if (!response.ok) {
      // If this still fails, it's because the .dev URL doesn't allow listing.
      // We may need to switch back to the SDK with the Vite fix we discussed.
      throw new Error(`R2 HTTP Error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const matches = [...xmlText.matchAll(/<Key>(.*?)<\/Key>/g)];
    const filenames = matches.map(m => m[1]);

    const projectMap: Record<string, any> = {};

    filenames.forEach((key) => {
      const relativeKey = key.replace(folderPrefix, "");
      const parts = relativeKey.split("/");
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
