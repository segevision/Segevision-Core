import {
  defaultVariantFor,
  sectionInstanceSchema,
  type SectionContent,
  type SectionInstance,
  type SectionType,
} from './schema';

/**
 * Section-instance operations.
 *
 * Kept in the renderer package rather than the platform app so that the rules for
 * creating, cloning and reordering sections live next to the schema that defines
 * them — the editor, a future API and any import tool all get the same behaviour.
 */

export function newSectionId(type: SectionType): string {
  return `sec-${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Deep clone via JSON — content is plain data by construction, so this is exact. */
export function cloneContent(content: SectionContent): SectionContent {
  return JSON.parse(JSON.stringify(content)) as SectionContent;
}

/**
 * Regenerates the ids of repeated content items.
 *
 * Without this a duplicated section would carry the original's service/FAQ/team ids,
 * and the media slots keyed by member id would collide between the two copies.
 */
function reidentifyContent(content: SectionContent): SectionContent {
  const next = cloneContent(content);
  const stamp = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  next.services = next.services?.map((item) => ({ ...item, id: `srv-${stamp()}` }));
  next.trustPoints = next.trustPoints?.map((item) => ({ ...item, id: `trust-${stamp()}` }));
  next.process = next.process?.map((item) => ({ ...item, id: `step-${stamp()}` }));
  next.features = next.features?.map((item) => ({ ...item, id: `feat-${stamp()}` }));
  next.team = next.team?.map((item) => ({ ...item, id: `team-${stamp()}` }));
  next.faq = next.faq?.map((item) => ({ ...item, id: `faq-${stamp()}` }));

  return next;
}

export function createSection(type: SectionType, content: SectionContent = {}): SectionInstance {
  const now = new Date().toISOString();
  return sectionInstanceSchema.parse({
    id: newSectionId(type),
    type,
    variant: defaultVariantFor(type),
    enabled: true,
    order: 0,
    content,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Produces an independent copy. The duplicate keeps its origin's variant and content
 * *values*, but shares no identity with it — new instance id, new content item ids,
 * fresh timestamps — so editing one can never alter the other.
 */
export function duplicateSection(section: SectionInstance): SectionInstance {
  const now = new Date().toISOString();
  return {
    ...section,
    id: newSectionId(section.type),
    content: reidentifyContent(section.content),
    presetId: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function insertAfter(
  sections: SectionInstance[],
  afterId: string,
  section: SectionInstance,
): SectionInstance[] {
  const index = sections.findIndex((item) => item.id === afterId);
  const next = [...sections];
  next.splice(index === -1 ? sections.length : index + 1, 0, section);
  return reorder(next);
}

export function moveSection(sections: SectionInstance[], id: string, offset: number): SectionInstance[] {
  const index = sections.findIndex((item) => item.id === id);
  const target = index + offset;
  if (index === -1 || target < 0 || target >= sections.length) return sections;
  const next = [...sections];
  [next[index], next[target]] = [next[target], next[index]];
  return reorder(next);
}

export function removeSection(sections: SectionInstance[], id: string): SectionInstance[] {
  return reorder(sections.filter((item) => item.id !== id));
}

/** Array position is the source of truth; the stored number is kept in step with it. */
export function reorder(sections: SectionInstance[]): SectionInstance[] {
  return sections.map((section, index) => (section.order === index ? section : { ...section, order: index }));
}

/* ----------------------------------------------------------------- presets */

export interface SectionPreset {
  id: string;
  name: string;
  type: SectionType;
  variant: string;
  content: SectionContent;
  /** Design values captured when the preset was saved, applied only on request. */
  design?: { primaryColor?: string; secondaryColor?: string; radius?: string };
  createdAt: string;
}

export function createPreset(
  section: SectionInstance,
  name: string,
  design?: SectionPreset['design'],
): SectionPreset {
  return {
    id: `preset-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: section.type,
    variant: section.variant,
    content: cloneContent(section.content),
    design,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Inserting a preset always yields a brand-new instance with re-identified content.
 * The preset is a snapshot, never a live reference — editing an inserted section can
 * never write back into the saved preset.
 */
export function sectionFromPreset(preset: SectionPreset): SectionInstance {
  const instance = createSection(preset.type, reidentifyContent(preset.content));
  return { ...instance, variant: preset.variant, presetId: preset.id };
}
