import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DATA_ROOT } from './data-root';

/**
 * Media storage — the local implementation, plus the vocabulary both implementations
 * share.
 *
 * A stored image is identified by its **key**: a `/`-joined path meaningful to whichever
 * backend holds the bytes. The browser never sees it directly — it sees
 * `/api/media/<key>`, a same-origin URL that stays valid for the lifetime of the project
 * document.
 *
 * That indirection is the important decision here. A Supabase signed URL expires, and an
 * expired URL saved inside a project document is silent data rot: the editor would show a
 * broken image weeks later with nothing in the logs to explain it. Proxying through our
 * own route keeps `src` permanent, keeps access tied to the session, and keeps the
 * preview iframe same-origin.
 *
 * Local keys:    <project-id>/<uuid>.<ext>
 * Supabase keys: <owner-id>/<project-id>/<slot>/<uuid>.<ext>
 */

export interface StoredMedia {
  /** URL the browser and the preview iframe fetch. Always same-origin. */
  url: string;
  /** Backend-specific path. Returned so a later delete does not have to guess it. */
  key: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface MediaUpload {
  projectId: string;
  /** Slot the image belongs to, e.g. `hero:hero`. Becomes a path segment. */
  slot: string;
  buffer: Buffer;
  contentType: string;
}

export interface MediaBytes {
  buffer: Buffer;
  contentType: string;
}

export interface MediaStore {
  save(upload: MediaUpload): Promise<StoredMedia>;
  read(key: string): Promise<MediaBytes | null>;
  remove(key: string): Promise<void>;
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

export const MEDIA_BUCKET = 'project-media';

function isSafeSegment(value: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(value) && !value.includes('..');
}

export function assertSafeSegment(value: string): void {
  if (!isSafeSegment(value)) {
    throw new Error('שם קובץ לא חוקי');
  }
}

/**
 * Validates a key and returns its segments, or null.
 *
 * Reads are driven by URLs, so this is the boundary a crafted path has to get past. It
 * returns null rather than throwing because a malformed key is a 404, not a server
 * error — a stack trace is information the caller did not have before.
 */
export function parseMediaKey(key: string): string[] | null {
  const segments = key.split('/').filter((segment) => segment.length > 0);
  if (segments.length < 2 || segments.length > 8) return null;
  if (!segments.every(isSafeSegment)) return null;
  return segments;
}

/**
 * A slot id such as `team:team:team-doron` is not a safe path segment, so it is folded to
 * `team-team-team-doron`. Lossy on purpose: the slot in the path exists to make the
 * bucket legible to a human, while the project document remains the only thing that maps
 * a slot to an image.
 */
export function mediaSlotSegment(slot: string): string {
  const folded = slot.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return folded.length > 0 ? folded.slice(0, 80) : 'slot';
}

/** Content type from the key's extension, so a read never trusts a stored MIME string. */
export function contentTypeForKey(key: string): string | null {
  const extension = key.split('.').pop()?.toLowerCase() ?? '';
  return Object.entries(ALLOWED_TYPES).find(([, ext]) => ext === extension)?.[0] ?? null;
}

export function extensionForContentType(contentType: string): string {
  const extension = ALLOWED_TYPES[contentType];
  if (!extension) throw new Error('סוג הקובץ אינו נתמך');
  return extension;
}

export function assertWithinSizeLimit(buffer: Buffer): void {
  if (buffer.byteLength > MAX_UPLOAD_BYTES) throw new Error('הקובץ גדול מדי');
}

/**
 * Files live under the repo-root .data directory, outside Next's watched tree, so an
 * upload does not trigger a dev-server recompile.
 *
 * Kept as the local-development and disaster-recovery adapter only. Production uploads go
 * to Supabase Storage — see ./stores/supabase-media-store.ts, and the refusal rules in
 * ./project-store.ts that stop this class being selected on an ephemeral disk.
 */
export class LocalMediaStore implements MediaStore {
  async save(upload: MediaUpload): Promise<StoredMedia> {
    assertSafeSegment(upload.projectId);
    const extension = extensionForContentType(upload.contentType);
    assertWithinSizeLimit(upload.buffer);

    const dir = path.join(MEDIA_DIR, upload.projectId);
    await mkdir(dir, { recursive: true });

    // The slot is deliberately not part of the local key. Existing project documents
    // already hold two-segment srcs, and rewriting them is the migration script's job,
    // not a side effect of the next upload.
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(dir, fileName), upload.buffer);
    const key = `${upload.projectId}/${fileName}`;

    return {
      url: `/api/media/${key}`,
      key,
      fileName,
      size: upload.buffer.byteLength,
      contentType: upload.contentType,
    };
  }

  async read(key: string): Promise<MediaBytes | null> {
    const segments = parseMediaKey(key);
    if (!segments) return null;
    const contentType = contentTypeForKey(key);
    if (!contentType) return null;

    try {
      const buffer = await readFile(path.join(MEDIA_DIR, ...segments));
      return { buffer, contentType };
    } catch {
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    const segments = parseMediaKey(key);
    if (!segments) return;
    try {
      await unlink(path.join(MEDIA_DIR, ...segments));
    } catch {
      // Already gone is a success.
    }
  }
}

export const localMediaStore: MediaStore = new LocalMediaStore();
export const MEDIA_DATA_DIR = MEDIA_DIR;
