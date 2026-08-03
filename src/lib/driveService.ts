export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export async function listDriveFiles(accessToken: string, query?: string, mimeTypeFilter?: string): Promise<DriveFile[]> {
  let q = "trashed = false";
  if (query && query.trim() !== "") {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }
  if (mimeTypeFilter && mimeTypeFilter !== "all") {
    if (mimeTypeFilter === "documents") {
      q += ` and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'text/markdown')`;
    } else if (mimeTypeFilter === "spreadsheets") {
      q += ` and (mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'text/csv')`;
    } else if (mimeTypeFilter === "folders") {
      q += ` and mimeType = 'application/vnd.google-apps.folder'`;
    }
  }

  const url = `https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink,parents)&q=${encodeURIComponent(q)}&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Drive API error (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

export async function fetchDriveFileContent(accessToken: string, fileId: string, mimeType: string): Promise<string> {
  let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  // If Google Doc, export as text/plain or markdown
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read file content (${response.status})`);
  }

  return await response.text();
}

export async function createDriveTextFile(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/markdown'
): Promise<DriveFile> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create file in Drive (${response.status})`);
  }

  return await response.json();
}

export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete file from Drive (${response.status})`);
  }
}
