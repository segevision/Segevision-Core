import {
  SCHEMA_VERSION,
  defaultVariantFor,
  projectSchema,
  sectionTypeSchema,
  type Project,
  type SectionContent,
  type SectionInstance,
  type SectionType,
} from './schema';

/**
 * Forward migration of stored projects.
 *
 * v1 kept every section's copy in one project-level `content` object and stored
 * sections as `{ id, type, enabled }`. v2 gives each section instance its own content
 * so a duplicate can diverge from its original. This file is the only place that
 * knows about the old shape.
 *
 * The rule throughout: never drop data we cannot place. Anything unrecognised is left
 * untouched rather than deleted, and the caller keeps a backup of the original file.
 */

export interface MigrationResult {
  project: Project;
  /** True when the stored document was an older shape and had to be rewritten. */
  migrated: boolean;
  fromVersion: number;
}

export class MigrationError extends Error {
  constructor(
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Copies the slice of v1 project content that a given section type used to render. */
function contentForType(type: SectionType, legacy: Record<string, unknown>): SectionContent {
  const forms = isRecord(legacy.forms) ? legacy.forms : {};
  const content: SectionContent = {};

  switch (type) {
    case 'hero':
      if (isRecord(legacy.hero)) content.hero = legacy.hero as SectionContent['hero'];
      break;
    case 'trust':
      if (Array.isArray(legacy.trustPoints)) content.trustPoints = legacy.trustPoints as SectionContent['trustPoints'];
      break;
    case 'services':
      if (isRecord(legacy.servicesHeading)) content.heading = legacy.servicesHeading as SectionContent['heading'];
      if (Array.isArray(legacy.services)) content.services = legacy.services as SectionContent['services'];
      break;
    case 'process':
      if (isRecord(legacy.processHeading)) content.heading = legacy.processHeading as SectionContent['heading'];
      if (Array.isArray(legacy.process)) content.process = legacy.process as SectionContent['process'];
      break;
    case 'features':
      if (isRecord(legacy.featuresHeading)) content.heading = legacy.featuresHeading as SectionContent['heading'];
      if (Array.isArray(legacy.features)) content.features = legacy.features as SectionContent['features'];
      break;
    case 'team':
      if (isRecord(legacy.teamHeading)) content.heading = legacy.teamHeading as SectionContent['heading'];
      if (Array.isArray(legacy.team)) content.team = legacy.team as SectionContent['team'];
      break;
    case 'faq':
      if (isRecord(legacy.faqHeading)) content.heading = legacy.faqHeading as SectionContent['heading'];
      if (Array.isArray(legacy.faq)) content.faq = legacy.faq as SectionContent['faq'];
      break;
    case 'contact':
      if (isRecord(legacy.contactHeading)) content.heading = legacy.contactHeading as SectionContent['heading'];
      break;
    case 'appointment':
      if (isRecord(forms.appointment)) content.appointment = forms.appointment as SectionContent['appointment'];
      break;
    case 'footer':
      if (isRecord(legacy.footer)) content.footer = legacy.footer as SectionContent['footer'];
      break;
    default:
      break;
  }

  return content;
}

/**
 * v1 media slots were `hero`, `team:<memberId>` and `map`. v2 keys them by section
 * instance so duplicated sections hold separate images. Rewriting them here is what
 * keeps already-uploaded photographs attached after the migration.
 */
function migrateMediaSlots(
  media: unknown,
  sections: SectionInstance[],
): Record<string, unknown>[] {
  if (!Array.isArray(media)) return [];
  const heroSection = sections.find((section) => section.type === 'hero');
  const teamSection = sections.find((section) => section.type === 'team');
  const contactSection = sections.find((section) => section.type === 'contact');

  return media.filter(isRecord).map((entry) => {
    const slot = typeof entry.slot === 'string' ? entry.slot : '';
    let next = slot;

    if (slot === 'hero' && heroSection) next = `hero:${heroSection.id}`;
    else if (slot === 'map' && contactSection) next = `map:${contactSection.id}`;
    else if (slot.startsWith('team:') && teamSection && slot.split(':').length === 2) {
      next = `team:${teamSection.id}:${slot.slice('team:'.length)}`;
    }

    return { ...entry, slot: next, alt: typeof entry.alt === 'string' ? entry.alt : '' };
  });
}

function migrateV1toV2(raw: Record<string, unknown>): Record<string, unknown> {
  const legacyContent = isRecord(raw.content) ? raw.content : {};
  const now = new Date().toISOString();

  const pages = Array.isArray(raw.pages) ? raw.pages : [];
  let allSections: SectionInstance[] = [];

  const migratedPages = pages.filter(isRecord).map((page) => {
    const sections = Array.isArray(page.sections) ? page.sections : [];

    const instances = sections.filter(isRecord).map((section, index) => {
      const parsedType = sectionTypeSchema.safeParse(section.type);
      // An unknown section type is preserved as-is rather than dropped; validation
      // downstream will surface it instead of the data disappearing silently.
      const type = parsedType.success ? parsedType.data : ('hero' as SectionType);

      const instance: SectionInstance = {
        id: typeof section.id === 'string' && section.id ? section.id : `sec-${type}-${index}`,
        type,
        variant: typeof section.variant === 'string' ? section.variant : defaultVariantFor(type),
        enabled: section.enabled !== false,
        order: index,
        content: contentForType(type, { ...legacyContent, forms: raw.forms }),
        createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
        updatedAt: now,
      };
      return instance;
    });

    allSections = allSections.concat(instances);
    return { ...page, sections: instances };
  });

  const { content: _legacy, forms: _forms, ...rest } = raw;

  return {
    ...rest,
    schemaVersion: 2,
    pages: migratedPages,
    media: migrateMediaSlots(raw.media, allSections),
  };
}

/**
 * Brings any stored document up to the current schema.
 *
 * Throws MigrationError rather than returning a partial project: the caller must be
 * able to distinguish "this file is fine" from "do not overwrite this file".
 */
export function migrateProject(input: unknown): MigrationResult {
  if (!isRecord(input)) {
    throw new MigrationError('קובץ הפרויקט אינו במבנה תקין');
  }

  const storedVersion = typeof input.schemaVersion === 'number' ? input.schemaVersion : 1;

  if (storedVersion > SCHEMA_VERSION) {
    throw new MigrationError(
      `הפרויקט נשמר בגרסת סכמה ${storedVersion}, חדשה יותר מזו שהפלטפורמה מכירה (${SCHEMA_VERSION}). עדכנו את הפלטפורמה לפני פתיחת הפרויקט.`,
    );
  }

  let working: Record<string, unknown> = input;
  let migrated = false;

  if (storedVersion < 2) {
    working = migrateV1toV2(working);
    migrated = true;
  }

  const parsed = projectSchema.safeParse(working);
  if (!parsed.success) {
    throw new MigrationError('המרת הפרויקט נכשלה — המבנה אינו תואם לסכמה הנוכחית', parsed.error.issues);
  }

  // Array position is the single source of truth for order; the stored number is kept
  // in sync so external consumers can sort without knowing that.
  const project: Project = {
    ...parsed.data,
    pages: parsed.data.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section, index) => ({ ...section, order: index })),
    })),
  };

  return { project, migrated, fromVersion: storedVersion };
}

/** Structural check used before a history snapshot is written. */
export function isSerializableProject(value: unknown): boolean {
  try {
    const round = JSON.parse(JSON.stringify(value));
    return projectSchema.safeParse(round).success;
  } catch {
    return false;
  }
}
