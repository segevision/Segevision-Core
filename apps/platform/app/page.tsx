'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@segevision/utils';
import {
  STATUS_LABELS,
  TEMPLATE_LABELS,
  THEME_PRESET_LABELS,
  evaluateReadiness,
  homeSections,
  type Project,
  type ProjectStatus,
  type ProjectSummary,
} from '@segevision/renderer';
import { TEMPLATE_LIST } from '@segevision/templates';
import { duplicateProject, fetchProject, fetchProjects, saveProject } from '../lib/client';
import { formatRelative } from '../lib/format';
import {
  EmptyNote,
  GroupLabel,
  IconButton,
  Menu,
  Skeleton,
  StatusPill,
  StudioButton,
  StudioLink,
  Tooltip,
} from '../components/studio';
import { ThemeToggle } from '../components/theme-toggle';
import { SignOutButton } from '../components/sign-out-button';
import { ProjectThumbnail } from '../components/project-thumbnail';
import { ReadinessRing, ReadinessChecklist } from '../components/readiness-ring';
import { useDialogFocus } from '../components/floating';

const STATUS_TONE: Record<ProjectStatus, 'neutral' | 'ok' | 'warn' | 'accent'> = {
  draft: 'neutral', review: 'warn', published: 'ok', archived: 'neutral',
};

/** Working order: what needs attention first, archived last. */
const GROUPS: { status: ProjectStatus; title: string; note: string }[] = [
  { status: 'review', title: 'ממתין ללקוח', note: 'נשלח לאישור ומחכה לתשובה' },
  { status: 'draft', title: 'בעבודה', note: 'טיוטות פעילות' },
  { status: 'published', title: 'באוויר', note: 'אתרים שכבר פורסמו' },
  { status: 'archived', title: 'ארכיון', note: 'לא בעבודה' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [summaries, setSummaries] = React.useState<ProjectSummary[] | null>(null);
  const [projects, setProjects] = React.useState<Record<string, Project>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [checklistFor, setChecklistFor] = React.useState<Project | null>(null);
  const checklistRef = React.useRef<HTMLDivElement>(null);
  useDialogFocus(checklistFor !== null, checklistRef);

  const load = React.useCallback(async () => {
    const list = await fetchProjects();
    setSummaries(list);
    // Full documents drive the readiness ring and the section count. Fetched after the
    // list so the page paints immediately rather than waiting on every project.
    const loaded = await Promise.all(list.map((item) => fetchProject(item.id).catch(() => null)));
    setProjects(Object.fromEntries(loaded.filter((p): p is Project => p !== null).map((p) => [p.id, p])));
  }, []);

  React.useEffect(() => {
    load().catch((cause: Error) => setError(cause.message));
  }, [load]);

  const counts = React.useMemo(() => {
    const base: Record<ProjectStatus, number> = { draft: 0, review: 0, published: 0, archived: 0 };
    (summaries ?? []).forEach((item) => { base[item.status] += 1; });
    return base;
  }, [summaries]);

  const duplicate = async (id: string) => {
    const source = projects[id];
    if (!source) return;
    setBusy(id);
    try {
      const copy = await duplicateProject(source);
      router.push(`/projects/${copy.id}`);
    } catch (cause) {
      setError((cause as Error).message);
      setBusy(null);
    }
  };

  const setStatus = async (id: string, status: ProjectStatus) => {
    const source = projects[id];
    if (!source) return;
    setBusy(id);
    try {
      await saveProject({ ...source, status });
      await load();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const visible = (summaries ?? []).filter((item) => item.status !== 'archived');
  const archived = (summaries ?? []).filter((item) => item.status === 'archived');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-studio-line bg-studio-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3 desktop:px-8">
          <div className="flex items-baseline gap-2.5">
            <span className="text-ui-lg font-extrabold tracking-tight text-studio-ink">Segevision</span>
            <span className="hidden border-s border-studio-line ps-2.5 text-ui-sm text-studio-muted tablet:inline">
              סטודיו האתרים
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
            <StudioLink href="/new" variant="primary" size="sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              פרויקט חדש
            </StudioLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 pb-[max(4rem,calc(3rem+env(safe-area-inset-bottom)))] pt-8 desktop:px-8 desktop:pt-12">
        {/* Title and tallies share one line: the studio's state should cost no vertical
            space, and a zero is deliberately quiet — an empty bucket is not news. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          <h1 className="text-ui-3xl font-extrabold tracking-tight text-studio-ink">מה בעבודה</h1>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            {([
              ['review', 'ממתין ללקוח'],
              ['draft', 'בעבודה'],
              ['published', 'באוויר'],
              ['archived', 'בארכיון'],
            ] as const).map(([status, label]) => {
              const value = summaries ? counts[status] : null;
              return (
                <div key={status} className="flex items-baseline gap-1.5">
                  <span
                    dir="ltr"
                    className={cn(
                      'font-studio-mono text-ui-lg font-bold tabular-nums',
                      value ? 'text-studio-ink' : 'text-studio-faint',
                    )}
                  >
                    {value ?? '—'}
                  </span>
                  <span className={cn('text-ui-sm', value ? 'text-studio-soft' : 'text-studio-faint')}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-studio-danger/10 px-4 py-3 text-ui-sm text-studio-danger ring-1 ring-inset ring-studio-danger/25">
            {error}
          </p>
        )}

        {!summaries && !error && (
          <div className="mt-7 grid gap-3 tablet:grid-cols-2 wide:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div key={card} className="overflow-hidden rounded-xl bg-studio-panel ring-1 ring-studio-line">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="flex flex-col gap-2 p-3.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="mt-2 h-8 w-full" />
                </div>
              </div>
            ))}
            <span className="sr-only">טוען פרויקטים</span>
          </div>
        )}

        {summaries && summaries.length === 0 && (
          <div className="mt-8">
            <EmptyNote title="עוד אין פרויקטים" action={<StudioLink href="/new" variant="primary">יצירת הפרויקט הראשון</StudioLink>}>
              כל פרויקט מתחיל מתבנית ענפית, ומשם עורכים תוכן ועיצוב עם תצוגה חיה לצד העריכה.
            </EmptyNote>
          </div>
        )}

        {summaries && summaries.length > 0 && (
          <div className="mt-7 flex flex-col gap-10">
            {GROUPS.map((group) => {
              const items = (group.status === 'archived' ? archived : visible).filter((item) => item.status === group.status);
              if (items.length === 0) return null;
              return (
                <section key={group.status}>
                  <div className="mb-3 flex items-baseline gap-2.5">
                    <GroupLabel>{group.title}</GroupLabel>
                    <span className="text-ui-xs text-studio-faint">{group.note}</span>
                  </div>
                  <ul className="grid gap-3 tablet:grid-cols-2 wide:grid-cols-3">
                    {items.map((item) => (
                      <ProjectCard
                        key={item.id}
                        summary={item}
                        project={projects[item.id]}
                        busy={busy === item.id}
                        onDuplicate={() => void duplicate(item.id)}
                        onStatus={(status) => void setStatus(item.id, status)}
                        onChecklist={() => projects[item.id] && setChecklistFor(projects[item.id])}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <section className="mt-14" aria-labelledby="quick-start">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <GroupLabel><span id="quick-start">התחלה מהירה</span></GroupLabel>
            <span className="text-ui-xs text-studio-faint">שלוש תבניות ענפיות</span>
          </div>
          <ul className="grid gap-2 tablet:grid-cols-2 desktop:grid-cols-3">
            {TEMPLATE_LIST.map((template) => (
              <li key={template.id}>
                <Link
                  href="/new"
                  className="group flex h-full flex-col rounded-xl bg-studio-panel p-4 ring-1 ring-studio-line transition-[box-shadow,transform] duration-[var(--t-state)] ease-studio hover:-translate-y-0.5 hover:shadow-studio-md"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-ui-base font-bold text-studio-ink transition-colors group-hover:text-studio-accent">{template.label}</span>
                    <span className="font-studio-mono text-ui-label text-studio-faint" dir="ltr">{template.sections.length}</span>
                  </span>
                  <span className="mt-1.5 block text-ui-xs leading-relaxed text-studio-muted">{template.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {checklistFor && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[8dvh]">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setChecklistFor(null)} aria-hidden="true" />
          <div ref={checklistRef} role="dialog" aria-modal="true" aria-label="מוכנות לפרסום" className="studio-pop studio-scroll relative max-h-[min(80dvh,44rem)] w-full max-w-[34rem] overflow-y-auto rounded-2xl bg-studio-panel p-5 shadow-studio-lg ring-1 ring-studio-line">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-ui-lg font-bold">{checklistFor.name} — מה חסר</h2>
              <IconButton aria-label="סגירה" onClick={() => setChecklistFor(null)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
              </IconButton>
            </div>
            <ReadinessChecklist project={checklistFor} compact />
            <StudioLink href={`/projects/${checklistFor.id}`} variant="primary" className="mt-5 w-full justify-center">
              פתיחת הפרויקט
            </StudioLink>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A project reads as the site it is, not as a row in a table. The live thumbnail leads,
 * because "what does it look like" is the question actually being asked here; status and
 * readiness sit on top of it, and the text below only has to answer "which one is this".
 */
function ProjectCard({
  summary,
  project,
  busy,
  onDuplicate,
  onStatus,
  onChecklist,
}: {
  summary: ProjectSummary;
  project?: Project;
  busy: boolean;
  onDuplicate: () => void;
  onStatus: (status: ProjectStatus) => void;
  onChecklist: () => void;
}) {
  const sections = project ? homeSections(project).filter((s) => s.enabled).length : null;
  const report = project ? evaluateReadiness(project) : null;
  const archived = summary.status === 'archived';

  return (
    <li>
      {/*
       * No `overflow-hidden` on the card.
       *
       * It used to be here to keep the thumbnail inside the rounded corners, and it also
       * clipped away the card's own action menu and tooltips — they are anchored in the
       * bottom row, so almost none of a downward-opening menu survived. The clip now lives
       * on the thumbnail, which is the only child that actually needs one.
       *
       * The hover lift stays, but note it makes this element a containing block for fixed
       * positioning; that is why the floating layer portals out rather than using `fixed`.
       */}
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-xl bg-studio-panel ring-1 ring-studio-line transition-[box-shadow,transform,opacity] duration-[var(--t-state)] ease-studio',
          archived ? 'opacity-70 hover:opacity-100' : 'hover:-translate-y-0.5 hover:shadow-studio-md',
          busy && 'pointer-events-none opacity-50',
        )}
      >
        <Link
          href={`/projects/${summary.id}`}
          className="relative block overflow-hidden rounded-t-xl"
          aria-label={`פתיחת ${summary.name}`}
        >
          <ProjectThumbnail projectId={summary.id} className="aspect-[16/10] w-full" />
          <span className="absolute start-2.5 top-2.5">
            <StatusPill tone={STATUS_TONE[summary.status]}>{STATUS_LABELS[summary.status]}</StatusPill>
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/projects/${summary.id}`} className="block">
                {/* Two lines then clamp, rather than truncate: a Hebrew project name is
                    often three or four words, and cutting it at one line loses the part
                    that distinguishes two projects for the same client. */}
                <span className="line-clamp-2 text-ui-lg font-bold leading-snug text-studio-ink transition-colors group-hover:text-studio-accent">
                  {summary.name}
                </span>
              </Link>
              <p className="mt-0.5 truncate text-ui-sm text-studio-muted">
                {summary.industry || 'ללא ענף'} · {TEMPLATE_LABELS[summary.template]}
              </p>
              {/* Secondary metadata is the first thing to go when the card is narrow. */}
              <p className="mt-1.5 truncate text-ui-xs text-studio-faint">
                <span className="hidden tablet:inline">
                  {sections !== null && `${sections} סקשנים · `}
                </span>
                עודכן {formatRelative(summary.updatedAt)}
              </p>
            </div>
            {report && (
              <Tooltip label={report.missing.length === 0 ? 'מוכן לפרסום' : `חסרים ${report.missing.length} פרטים — לחצו לפירוט`}>
                <span className="shrink-0">
                  <ReadinessRing project={project!} size={40} onOpen={onChecklist} />
                </span>
              </Tooltip>
            )}
          </div>

          <div className="mt-auto flex items-center gap-1.5 border-t border-studio-line pt-3">
            <StudioLink href={`/projects/${summary.id}`} variant="primary" size="sm" className="flex-1 justify-center">
              {archived ? 'פתיחה' : 'המשך עריכה'}
            </StudioLink>
            <Tooltip label="פתיחה בכרטיסייה">
              <a
                href={`/preview?id=${summary.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`תצוגה מלאה של ${summary.name}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-studio-muted transition-colors hover:bg-studio-raised hover:text-studio-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6" /><circle cx="12" cy="12" r="2.5" />
                </svg>
              </a>
            </Tooltip>
            <Menu
              label={`פעולות עבור ${summary.name}`}
              items={[
                { id: 'dup', label: 'שכפול', onSelect: onDuplicate },
                ...(archived
                  ? [{ id: 'restore', label: 'החזרה מהארכיון', onSelect: () => onStatus('draft') }]
                  : [
                      { id: 'review', label: 'שליחה לאישור הלקוח', onSelect: () => onStatus('review') },
                      { id: 'archive', label: 'העברה לארכיון', onSelect: () => onStatus('archived') },
                    ]),
              ]}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
