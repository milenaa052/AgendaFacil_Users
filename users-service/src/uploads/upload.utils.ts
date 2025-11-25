import { join, isAbsolute } from 'path';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export async function removeFileByUrl(fileUrl?: string) {
  if (!fileUrl) return;

  try {
    let filename = fileUrl;
    if (fileUrl.includes('/')) {
      filename = fileUrl.split('/').pop() || '';
    }
    if (!filename) return;

    const fullPath = isAbsolute(filename)
      ? filename
      : join(process.cwd(), UPLOAD_DIR, filename);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (err) {
    console.warn('Failed to remove file', err);
  }
}

export function avatarUrlFromFilename(filename: string) {
  return `/uploads/${filename}`;
}
