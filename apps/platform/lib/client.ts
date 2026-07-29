import type { Project, ProjectSummary } from '@segevision/renderer';

/** Thin fetch layer. Everything the editor does goes through these four calls. */

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'הפעולה נכשלה');
  }
  return response.json() as Promise<T>;
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const data = await handle<{ projects: ProjectSummary[] }>(
    await fetch('/api/projects', { cache: 'no-store' }),
  );
  return data.projects;
}

export async function fetchProject(id: string): Promise<Project> {
  const data = await handle<{ project: Project }>(
    await fetch(`/api/projects/${id}`, { cache: 'no-store' }),
  );
  return data.project;
}

export async function createProject(project: Project): Promise<Project> {
  const data = await handle<{ project: Project }>(
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(project),
    }),
  );
  return data.project;
}

export async function saveProject(project: Project): Promise<Project> {
  const data = await handle<{ project: Project }>(
    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(project),
    }),
  );
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await handle<{ ok: boolean }>(await fetch(`/api/projects/${id}`, { method: 'DELETE' }));
}

export interface UploadedMedia {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
}

export async function uploadMedia(projectId: string, file: File): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('projectId', projectId);
  form.append('file', file);

  const response = await fetch('/api/media', { method: 'POST', body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'ההעלאה נכשלה');
  }
  const data = (await response.json()) as { media: UploadedMedia };
  return data.media;
}

/**
 * Duplicates a project into a fully independent copy.
 *
 * Everything that identifies the original is regenerated — project id, slug, section
 * instance ids and every repeated content id — so the two projects can never write
 * into each other. Publication state is deliberately reset: a duplicate has not been
 * approved by anyone and is not connected to any domain.
 */
export async function duplicateProject(source: Project): Promise<Project> {
  const stamp = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const clone = JSON.parse(JSON.stringify(source)) as Project;

  const idMap = new Map<string, string>();
  const pages = clone.pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => {
      const nextId = `sec-${section.type}-${stamp()}`;
      idMap.set(section.id, nextId);
      const content = JSON.parse(JSON.stringify(section.content)) as typeof section.content;
      content.services = content.services?.map((item) => ({ ...item, id: `srv-${stamp()}` }));
      content.trustPoints = content.trustPoints?.map((item) => ({ ...item, id: `trust-${stamp()}` }));
      content.process = content.process?.map((item) => ({ ...item, id: `step-${stamp()}` }));
      content.features = content.features?.map((item) => ({ ...item, id: `feat-${stamp()}` }));
      content.team = content.team?.map((item) => ({ ...item, id: `team-${stamp()}` }));
      content.faq = content.faq?.map((item) => ({ ...item, id: `faq-${stamp()}` }));
      return { ...section, id: nextId, content, presetId: undefined, createdAt: now, updatedAt: now };
    }),
  }));

  // Media slots are keyed by section id, so they have to follow the remap or the
  // copy would silently lose every image.
  const media = clone.media.map((entry) => {
    const parts = entry.slot.split(':');
    if (parts.length >= 2 && idMap.has(parts[1])) {
      parts[1] = idMap.get(parts[1])!;
      return { ...entry, slot: parts.join(':') };
    }
    return entry;
  });

  const baseSlug = clone.slug.replace(/-copy(-\d+)?$/, '');
  const existing = await fetchProjects();
  let slug = `${baseSlug}-copy`;
  let counter = 2;
  while (existing.some((item) => item.slug === slug)) slug = `${baseSlug}-copy-${counter++}`;

  return createProject({
    ...clone,
    id: `prj_${stamp()}`,
    name: `עותק של ${clone.name}`,
    slug,
    status: 'draft',
    pages,
    media,
    createdAt: now,
    updatedAt: now,
  });
}
