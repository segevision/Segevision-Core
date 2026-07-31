import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  MEDIA_BUCKET,
  assertSafeSegment,
  assertWithinSizeLimit,
  contentTypeForKey,
  extensionForContentType,
  mediaSlotSegment,
  parseMediaKey,
  type MediaBytes,
  type MediaStore,
  type MediaUpload,
  type StoredMedia,
} from '../media-storage';

/**
 * Project media in Supabase Storage.
 *
 * Path convention — <owner-id>/<project-id>/<slot>/<uuid>.<ext>
 *
 * The owner uuid leads because it is what the Storage RLS policies key on
 * (`(storage.foldername(name))[1] = auth.uid()`). The uuid filename is what makes
 * "replace this photo" safe to cache forever: a replacement is a new object at a new key,
 * so no CDN or browser ever has to be told to forget the old one.
 *
 * Like SupabaseProjectStore, this takes a session-carrying client and is therefore
 * request-scoped. Never cache an instance in a module.
 */
export class SupabaseMediaStore implements MediaStore {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly ownerId: string,
  ) {}

  async save(upload: MediaUpload): Promise<StoredMedia> {
    assertSafeSegment(upload.projectId);
    const extension = extensionForContentType(upload.contentType);
    assertWithinSizeLimit(upload.buffer);

    const fileName = `${randomUUID()}.${extension}`;
    const key = `${this.ownerId}/${upload.projectId}/${mediaSlotSegment(upload.slot)}/${fileName}`;

    const { error } = await this.supabase.storage.from(MEDIA_BUCKET).upload(key, upload.buffer, {
      contentType: upload.contentType,
      // The key contains a fresh uuid, so an upsert can only ever be a retry of this
      // same upload. Left false so a genuine key collision surfaces instead of
      // overwriting bytes.
      upsert: false,
    });

    if (error) throw new Error(`העלאת התמונה נכשלה: ${error.message}`);

    return {
      url: `/api/media/${key}`,
      key,
      fileName,
      size: upload.buffer.byteLength,
      contentType: upload.contentType,
    };
  }

  async read(key: string): Promise<MediaBytes | null> {
    if (!parseMediaKey(key)) return null;
    const contentType = contentTypeForKey(key);
    if (!contentType) return null;

    const { data, error } = await this.supabase.storage.from(MEDIA_BUCKET).download(key);

    // An object under another owner's folder is invisible to this session's policies, so
    // "forbidden" and "missing" arrive identically — and both are a 404 to the caller.
    // That is the correct answer to give: it leaks nothing about what exists.
    if (error || !data) return null;

    return { buffer: Buffer.from(await data.arrayBuffer()), contentType };
  }

  async remove(key: string): Promise<void> {
    if (!parseMediaKey(key)) return;
    // Storage remove() reports success for a key that was already gone, which matches the
    // local store: deleting something twice is not an error.
    await this.supabase.storage.from(MEDIA_BUCKET).remove([key]);
  }
}
