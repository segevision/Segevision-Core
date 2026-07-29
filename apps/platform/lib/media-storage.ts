import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DATA_ROOT } from './data-root';

/**
 * Media storage — v1.
 *
 * Same shape as ProjectStore: one interface, one local implementation, so moving to
 * Supabase Storage later is a new class rather than a rewrite. Files live beside the
 * project JSON under the repo-root .data directory, outside Next's watched tree.
 */

export interface StoredMedia {
  /** URL the browser and the preview iframe fetch. Always same-origin. */
  url: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface MediaStore {
  save(projectId: string, file: { buffer: Buffer; contentType: string }): Promise<StoredMedia>;
  read(projectId: string, fileName: string): Promise<{ buffer: Buffer; contentType: string } | null>;
  remove(projectId: string, fileName: string): Promise<void>;
}

const MEDIA_DIR = process.env.SEGEVISION_MEDIA_DIR ?? path.join(DATA_ROOT, 'media');

/** Only formats a browser renders natively. Anything else is rejected at the door. */
export const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function isSafeSegment(value: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(value) && !value.includes('..');
}

function assertSafeSegment(value: string): void {
  if (!isSafeSegment(value)) {
    throw new Error('שם קובץ לא חוקי');
  }
}

class LocalMediaStore implements MediaStore {
  async save(projectId: string, file: { buffer: Buffer; contentType: string }): Promise<StoredMedia> {
    assertSafeSegment(projectId);
    const extension = ALLOWED_TYPES[file.contentType];
    if (!extension) throw new Error('סוג הקובץ אינו נתמך');
    if (file.buffer.byteLength > MAX_UPLOAD_BYTES) throw new Error('הקובץ גדול מדי');

    const dir = path.join(MEDIA_DIR, projectId);
    await mkdir(dir, { recursive: true });

    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(dir, fileName), file.buffer);

    return {
      url: `/api/media/${projectId}/${fileName}`,
      fileName,
      size: file.buffer.byteLength,
      contentType: file.contentType,
    };
  }

  async read(projectId: string, fileName: string) {
    // A malformed path is "not found", not a server error — reads are driven by URLs
    // and a crafted one must never surface a stack trace.
    if (!isSafeSegment(projectId) || !isSafeSegment(fileName)) return null;
    const extension = fileName.split('.').pop() ?? '';
    const contentType = Object.entries(ALLOWED_TYPES).find(([, ext]) => ext === extension)?.[0];
    if (!contentType) return null;

    try {
      const buffer = await readFile(path.join(MEDIA_DIR, projectId, fileName));
      return { buffer, contentType };
    } catch {
      return null;
    }
  }

  async remove(projectId: string, fileName: string): Promise<void> {
    if (!isSafeSegment(projectId) || !isSafeSegment(fileName)) return;
    try {
      await unlink(path.join(MEDIA_DIR, projectId, fileName));
    } catch {
      // Already gone is a success.
    }
  }
}

export const mediaStore: MediaStore = new LocalMediaStore();

/**
 * MIGRATION TO SUPABASE STORAGE
 * -----------------------------
 * 1. Create a `project-media` bucket, one folder per project id.
 * 2. Add SupabaseMediaStore implementing this interface: save() uploads and returns
 *    the public (or signed) URL, read() is no longer needed because Supabase serves
 *    the file directly, remove() deletes the object.
 * 3. Swap the export below. Because the project stores a plain `src` URL, images
 *    already uploaded through the local store keep working until they are replaced —
 *    there is no data migration, only a cutover for new uploads.
 */
