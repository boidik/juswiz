const fs = require('fs');

/**
 * Ensures the dedicated folder (05_AutoFetched_Court_Orders) exists in the case folder
 * and uploads the genuine PDF binary into it.
 */
async function uploadToDedicatedDriveFolder({
  fileBuffer,
  fileName,
  parentFolderId,
  accessToken,
  dedicatedFolderName = '05_AutoFetched_Court_Orders'
}) {
  if (!accessToken) {
    return {
      success: false,
      isFallback: true,
      fileId: null,
      driveUrl: parentFolderId 
        ? `https://drive.google.com/drive/folders/${parentFolderId}`
        : `https://drive.google.com/drive/search?q=${encodeURIComponent(fileName)}`
    };
  }

  try {
    let targetFolderId = parentFolderId;

    // 1. If parent folder is provided, check or create the dedicated subfolder
    if (parentFolderId) {
      try {
        const query = encodeURIComponent(`'${parentFolderId}' in parents and name = '${dedicatedFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
        const listResp = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (listResp.ok) {
          const listData = await listResp.json();
          if (listData.files && listData.files.length > 0) {
            targetFolderId = listData.files[0].id;
          } else {
            // Create the dedicated folder
            const createResp = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: dedicatedFolderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId]
              })
            });
            if (createResp.ok) {
              const createdFolder = await createResp.json();
              targetFolderId = createdFolder.id;
              console.log(`[Drive Sync] Created dedicated folder: ${dedicatedFolderName} (ID: ${targetFolderId})`);
            }
          }
        }
      } catch (folderErr) {
        console.warn('[Drive Sync] Subfolder check error, defaulting to parent folder:', folderErr.message);
      }
    }

    // 2. Upload file multipart
    const metadata = {
      name: fileName,
      parents: targetFolderId ? [targetFolderId] : []
    };

    const boundary = '-------juswiz314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadataPart = Buffer.from(JSON.stringify(metadata), 'utf-8');
    const headerPart = Buffer.from(
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n'
    );
    const middlePart = Buffer.from(
      delimiter +
      'Content-Type: application/pdf\r\n\r\n'
    );
    const footerPart = Buffer.from(close_delim);

    const fullBody = Buffer.concat([
      headerPart,
      metadataPart,
      middlePart,
      fileBuffer,
      footerPart
    ]);

    const uploadResp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: fullBody
    });

    if (uploadResp.ok) {
      const data = await uploadResp.json();
      console.log(`[Drive Sync] Successfully uploaded ${fileName} to Drive (File ID: ${data.id})`);
      return {
        success: true,
        fileId: data.id,
        driveUrl: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
        dedicatedFolderId: targetFolderId
      };
    } else {
      const errJson = await uploadResp.json().catch(() => ({}));
      console.warn('[Drive Sync] Drive API upload rejected:', errJson);
      return {
        success: false,
        isFallback: true,
        fileId: null,
        driveUrl: `https://drive.google.com/drive/search?q=${encodeURIComponent(fileName)}`
      };
    }
  } catch (err) {
    console.error('[Drive Sync] Error in uploadToDedicatedDriveFolder:', err.message);
    return {
      success: false,
      isFallback: true,
      fileId: null,
      driveUrl: `https://drive.google.com/drive/search?q=${encodeURIComponent(fileName)}`
    };
  }
}

module.exports = {
  uploadToDedicatedDriveFolder
};
