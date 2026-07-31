'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@segevision/utils';
import {
  SECTION_LABELS,
  STATUS_LABELS,
  createPreset,
  createSection,
  duplicateSection,
  evaluateReadiness,
  findField,
  homePage,
  homeSections,
  insertAfter,
  isProjectLevelPath,
  removeSection,
  reorder,
  type Project,
  type ReadinessCheck,
  type SectionInstance,
} from '@segevision/renderer';
import { TEMPLATE_LIST } from '@segevision/templates';
import { fetchProject, saveProject } from '../../../lib/client';
import { formatRelative } from '../../../lib/format';
import { versionStore } from '../../../lib/history';
import { presetStore } from '../../../lib/presets';
import {
  EmptyNote,
  GroupLabel,
  IconButton,
  Menu,
  Panel,
  StatusPill,
  StudioButton,
  Tooltip,
} from '../../../components/studio';
import { ThemeToggle } from '../../../components/theme-toggle';
import { SignOutButton } from '../../../components/sign-out-button';
import { PreviewPanel, type PreviewSettings } from '../../../components/preview-panel';
import { useFieldFocus, type FieldFocus, type Updater } from '../../../components/editor-shared';
import { OverviewPanel } from '../../../components/panel-overview';
import { SectionContentEditor } from '../../../components/panel-content';
import { DesignPanel, MediaPanel, SeoPanel } from '../../../components/panel-design';
import { HistoryPanel } from '../../../components/panel-history';
import { CommandPalette, buildFieldCommands, type Command } from '../../../components/command-palette';
import { SiteStructure } from '../../../components/site-structure';
import { VariantPicker } from '../../../components/variant-picker';
import { ReadinessChecklist, ReadinessRing } from '../../../components/readiness-ring';
import { AddSectionPanel, PresetsPanel } from '../../../components/add-section';

/** Settings are configured occasionally; sections are edited constantly. */
type SettingsTab = 'settings-business' | 'settings-design' | 'settings-media' | 'settings-seo' | 'settings-history';

const SETTINGS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'settings-business', label: 'פרטי העסק', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5' },
  { id: 'settings-design', label: 'עיצוב', icon: 'M12 3a9 9 0 1 0 0 18h2a3 3 0 0 0 0-6h-1a2 2 0 0 1 0-4h3a3 3 0 0 0 0-6z' },
  { id: 'settings-media', label: 'תמונות', icon: 'M4 5h16v14H4zM8 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M4 16l5-5 4 4 3-2 4 4' },
  { id: 'settings-seo', label: 'קידום בגוגל', icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M16.5 16.5 21 21' },
  { id: 'settings-history', label: 'גרסאות', icon: 'M12 8v5l3 2M3 12a9 9 0 1 0 3-6.7M3 4v4h4' },
];

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
const SAVE_LABEL: Record<SaveState, string> = {
  idle: 'הכול שמור',
  dirty: 'יש שינויים',
  saving: 'שומר…',
  saved: 'הכול נשמר',
  error: 'השמירה נכשלה',
};
const SAVE_TONE: Record<SaveState, 'ok' | 'warn' | 'neutral' | 'danger'> = {
  idle: 'neutral', dirty: 'warn', saving: 'warn', saved: 'ok', error: 'danger',
};

const LAYOUT_KEY = 'segevision-editor-width';
const DEFAULT_WIDTH = 470;
const MIN_EDITOR = 340;
const MIN_PREVIEW = 380;
const COALESCE_MS = 600;
const MAX_UNDO = 60;

export default function ProjectEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = React.useState<Project | null>(null);
  const [loadError, setLoadError] = React.useState<{ message: string; recovery?: string } | null>(null);
  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);
  const [settingsTab, setSettingsTab] = React.useState<SettingsTab | null>(null);
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [mobileView, setMobileView] = React.useState<'edit' | 'preview'>('edit');
  const [present, setPresent] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [readinessOpen, setReadinessOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [focus, setFocus] = React.useState<FieldFocus | null>(null);
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [historyToken, setHistoryToken] = React.useState(0);
  const [editorWidth, setEditorWidth] = React.useState(DEFAULT_WIDTH);
  const [toast, setToast] = React.useState<string | null>(null);

  const [preview, setPreview] = React.useState<PreviewSettings>({
    device: 'desktop', customWidth: 1200, zoom: 'fit', selectMode: false,
  });

  const undoStack = React.useRef<Project[]>([]);
  const redoStack = React.useRef<Project[]>([]);
  const lastCoalesce = React.useRef<{ key: string; at: number } | null>(null);
  const [, forceRender] = React.useReducer((x: number) => x + 1, 0);
  const saveTimer = React.useRef<number | null>(null);
  const latest = React.useRef<Project | null>(null);

  useFieldFocus(focus);

  const flash = React.useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  React.useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(LAYOUT_KEY));
      if (stored >= MIN_EDITOR) setEditorWidth(stored);
    } catch { /* default width */ }
  }, []);

  React.useEffect(() => {
    fetchProject(projectId)
      .then((loaded) => {
        setProject(loaded);
        latest.current = loaded;
        const first = homeSections(loaded).find((s) => !['header', 'footer', 'mobileBar'].includes(s.type));
        setSelectedSectionId(first?.id ?? homeSections(loaded)[0]?.id ?? null);
      })
      .catch((cause: Error) => setLoadError({ message: cause.message }));
  }, [projectId]);

  const persist = React.useCallback(async () => {
    const current = latest.current;
    if (!current) return;
    setSaveState('saving');
    try {
      const saved = await saveProject(current);
      latest.current = { ...current, updatedAt: saved.updatedAt };
      setProject((v) => (v ? { ...v, updatedAt: saved.updatedAt } : v));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, []);

  const commit = React.useCallback(
    (next: Project, options?: { coalesceKey?: string; snapshotLabel?: string }) => {
      const previous = latest.current;
      if (previous) {
        const now = Date.now();
        const key = options?.coalesceKey;
        const canCoalesce = key && lastCoalesce.current?.key === key && now - lastCoalesce.current.at < COALESCE_MS;
        if (!canCoalesce) {
          undoStack.current = [...undoStack.current, previous].slice(-MAX_UNDO);
          redoStack.current = [];
        }
        lastCoalesce.current = key ? { key, at: now } : null;
      }
      latest.current = next;
      setProject(next);
      forceRender();
      setSaveState('dirty');
      if (options?.snapshotLabel) {
        versionStore.save(projectId, next, options.snapshotLabel);
        setHistoryToken((v) => v + 1);
      }
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(persist, 900);
    },
    [persist, projectId],
  );

  const update: Updater = React.useCallback(
    (recipe, options) => {
      const current = latest.current;
      if (!current) return;
      commit(recipe(current), options);
    },
    [commit],
  );

  const updateStructural = React.useCallback(
    (recipe: (draft: Project) => Project, label: string) => {
      const current = latest.current;
      if (!current) return;
      commit(recipe(current), { snapshotLabel: label });
    },
    [commit],
  );

  const applyHistory = React.useCallback(
    (from: React.MutableRefObject<Project[]>, to: React.MutableRefObject<Project[]>) => {
      const target = from.current[from.current.length - 1];
      const current = latest.current;
      if (!target || !current) return;
      from.current = from.current.slice(0, -1);
      to.current = [...to.current, current];
      lastCoalesce.current = null;
      latest.current = target;
      setProject(target);
      forceRender();
      setSaveState('dirty');
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(persist, 900);
    },
    [persist],
  );

  const undo = React.useCallback(() => applyHistory(undoStack, redoStack), [applyHistory]);
  const redo = React.useCallback(() => applyHistory(redoStack, undoStack), [applyHistory]);

  const selectSection = React.useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSettingsTab(null);
    setMobileView('edit');
  }, []);

  const jumpToField = React.useCallback((sectionId: string | undefined, path: string) => {
    if (isProjectLevelPath(path)) setSettingsTab('settings-business');
    else if (sectionId) {
      setSelectedSectionId(sectionId);
      setSettingsTab(null);
    }
    setMobileView('edit');
    setSelectedPath(sectionId && !isProjectLevelPath(path) ? `${sectionId}::${path}` : path);
    setFocus({ sectionId: isProjectLevelPath(path) ? undefined : sectionId, path, nonce: Date.now() });
  }, []);

  const fixReadiness = React.useCallback((check: ReadinessCheck) => {
    setReadinessOpen(false);
    const tab = check.fix?.tab;
    if (!tab) return;
    if (tab.startsWith('settings-')) setSettingsTab(tab as SettingsTab);
    else if (check.fix?.sectionId) selectSection(check.fix.sectionId);
    else setSettingsTab(null);
  }, [selectSection]);

  /* ------------------------------------------------------------ shortcuts */

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (event.key === '?' && !typing) { event.preventDefault(); setShortcutsOpen((v) => !v); return; }
      if (event.key.toLowerCase() === 'p' && !typing && !event.metaKey && !event.ctrlKey) { event.preventDefault(); setPresent(true); return; }
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === 's') { event.preventDefault(); if (saveTimer.current) window.clearTimeout(saveTimer.current); void persist(); }
      else if (key === 'k') { event.preventDefault(); setPaletteOpen((v) => !v); }
      else if (key === 'z' && !event.shiftKey) { event.preventDefault(); undo(); }
      else if ((key === 'z' && event.shiftKey) || key === 'y') { event.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [persist, undo, redo]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (present) setPresent(false);
      else if (readinessOpen) setReadinessOpen(false);
      else if (shortcutsOpen) setShortcutsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [present, readinessOpen, shortcutsOpen]);

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveState === 'dirty' || saveState === 'saving') event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveState]);

  /* --------------------------------------------------------------- resize */

  const dragging = React.useRef(false);
  const applyWidth = React.useCallback((next: number) => {
    const max = Math.max(MIN_EDITOR, window.innerWidth - MIN_PREVIEW);
    const clamped = Math.min(Math.max(next, MIN_EDITOR), max);
    setEditorWidth(clamped);
    try { window.localStorage.setItem(LAYOUT_KEY, String(clamped)); } catch { /* session only */ }
  }, []);

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      // RTL: the editor is the right-hand column, so width grows as the pointer moves
      // left — measured from the viewport's right edge.
      applyWidth(window.innerWidth - event.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [applyWidth]);

  /* ------------------------------------------------------------- sections */

  const sections = project ? homeSections(project) : [];
  const selected = sections.find((s) => s.id === selectedSectionId) ?? null;

  const withSections = (draft: Project, next: SectionInstance[]): Project => {
    const home = homePage(draft);
    if (!home) return draft;
    return { ...draft, pages: draft.pages.map((p) => (p.id === home.id ? { ...p, sections: reorder(next) } : p)) };
  };

  const templateContentFor = (draft: Project, type: SectionInstance['type']) => {
    const template = TEMPLATE_LIST.find((t) => t.id === draft.template) ?? TEMPLATE_LIST[0];
    const fresh = template.buildContent(draft.business.displayName || draft.name);
    switch (type) {
      case 'hero': return { hero: fresh.hero };
      case 'trust': return { trustPoints: fresh.trustPoints };
      case 'services': return { heading: fresh.servicesHeading, services: fresh.services };
      case 'process': return { heading: fresh.processHeading, process: fresh.process };
      case 'features': return { heading: fresh.featuresHeading, features: fresh.features };
      case 'team': return { heading: fresh.teamHeading, team: fresh.team };
      case 'faq': return { heading: fresh.faqHeading, faq: fresh.faq };
      case 'contact': return { heading: fresh.contactHeading };
      case 'footer': return { footer: fresh.footer };
      default: return {};
    }
  };

  const sectionActions = React.useMemo(
    () => ({
      duplicate: (section: SectionInstance) => {
        const copy = duplicateSection(section);
        updateStructural((draft) => withSections(draft, insertAfter(homeSections(draft), section.id, copy)), 'שכפול סקשן');
        setSelectedSectionId(copy.id);
        flash('הסקשן שוכפל. העותק עצמאי לגמרי.');
      },
      reset: (section: SectionInstance) => {
        updateStructural(
          (draft) => withSections(draft, homeSections(draft).map((s) => (s.id === section.id ? { ...s, content: templateContentFor(draft, s.type) } : s))),
          'איפוס סקשן',
        );
        flash('הסקשן אופס לתוכן התבנית.');
      },
      savePreset: (section: SectionInstance) => {
        if (!project) return;
        presetStore.save(createPreset(section, SECTION_LABELS[section.type], {
          primaryColor: project.design.primaryColor,
          secondaryColor: project.design.secondaryColor,
          radius: project.design.radius,
        }));
        flash('נשמר כפריסט וזמין בכל הפרויקטים.');
      },
      remove: (section: SectionInstance) => {
        if (!window.confirm(`למחוק את «${SECTION_LABELS[section.type]}»? אפשר לבטל מיד אחרי.`)) return;
        updateStructural((draft) => withSections(draft, removeSection(homeSections(draft), section.id)), 'מחיקת סקשן');
        setSelectedSectionId((current) => (current === section.id ? null : current));
        flash('הסקשן נמחק. ⌘Z מחזיר אותו.');
      },
      toggle: (section: SectionInstance) => {
        updateStructural(
          (draft) => withSections(draft, homeSections(draft).map((s) => (s.id === section.id ? { ...s, enabled: !s.enabled } : s))),
          section.enabled ? 'כיבוי סקשן' : 'הפעלת סקשן',
        );
      },
    }),
    [updateStructural, project, flash],
  );

  /* -------------------------------------------------------------- commands */

  const commands = React.useMemo<Command[]>(() => {
    if (!project) return [];
    const sectionCommands: Command[] = homeSections(project).map((section, index) => ({
      id: `sec-${section.id}`,
      label: SECTION_LABELS[section.type],
      group: 'מעבר לסקשן',
      keywords: ['סקשן', 'מעבר'],
      hint: String(index + 1).padStart(2, '0'),
      run: () => selectSection(section.id),
    }));
    const settingsCommands: Command[] = SETTINGS.map((item) => ({
      id: `set-${item.id}`,
      label: item.label,
      group: 'הגדרות',
      run: () => { setSettingsTab(item.id); setMobileView('edit'); },
    }));
    const actions: Command[] = [
      { id: 'save', label: 'שמירה', group: 'פעולות', hint: '⌘S', run: () => void persist() },
      { id: 'undo', label: 'ביטול', group: 'פעולות', hint: '⌘Z', run: undo },
      { id: 'redo', label: 'ביצוע חוזר', group: 'פעולות', hint: '⇧⌘Z', run: redo },
      { id: 'present', label: 'תצוגה מלאה ללקוח', group: 'תצוגה', hint: 'P', run: () => setPresent(true) },
      { id: 'select', label: 'לחיצה לעריכה', group: 'תצוגה', run: () => setPreview((v) => ({ ...v, selectMode: !v.selectMode })) },
      { id: 'ready', label: 'מה חסר לפני פרסום', group: 'פעולות', run: () => setReadinessOpen(true) },
      { id: 'layout', label: 'איפוס פריסת העורך', group: 'תצוגה', run: () => applyWidth(DEFAULT_WIDTH) },
      ...(['desktop', 'tablet', 'mobile'] as const).map((device) => ({
        id: `dev-${device}`,
        label: `תצוגת ${device === 'desktop' ? 'מחשב' : device === 'tablet' ? 'טאבלט' : 'נייד'}`,
        group: 'תצוגה',
        run: () => setPreview((v) => ({ ...v, device })),
      })),
    ];
    return [...sectionCommands, ...actions, ...settingsCommands, ...buildFieldCommands(project, jumpToField)];
  }, [project, persist, undo, redo, jumpToField, applyWidth, selectSection]);

  /* ----------------------------------------------------------------- views */

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-ui-xl font-bold">לא הצלחנו לפתוח את הפרויקט</h1>
        <p className="max-w-[42ch] text-ui-sm text-studio-muted">{loadError.message}</p>
        <Link href="/" className="text-ui-sm font-bold text-studio-accent underline">חזרה לפרויקטים</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col gap-3 p-6">
        <div className="studio-skeleton h-12 w-full rounded-xl" />
        <div className="flex flex-1 gap-3">
          <div className="studio-skeleton w-64 rounded-xl" />
          <div className="studio-skeleton w-96 rounded-xl" />
          <div className="studio-skeleton flex-1 rounded-xl" />
        </div>
        <span className="sr-only">טוען את הפרויקט</span>
      </div>
    );
  }

  const report = evaluateReadiness(project);
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  const previewNode = (
    <PreviewPanel
      project={project}
      settings={preview}
      onSettingsChange={(next) => setPreview((v) => ({ ...v, ...next }))}
      onSelectField={jumpToField}
      onSelectSection={selectSection}
      selectedPath={selectedPath}
      selectedSectionId={selectedSectionId}
      saveLabel={SAVE_LABEL[saveState]}
      saveTone={SAVE_TONE[saveState]}
      onPresent={() => setPresent(true)}
      className="h-full min-h-[24rem] desktop:min-h-0"
    />
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-studio-canvas">
      {/* ------------------------------------------------------------ top bar */}
      <header className="z-30 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-studio-line bg-studio-panel px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Tooltip label="חזרה לפרויקטים">
            <IconButton
              aria-label="חזרה לפרויקטים"
              onClick={() => {
                if ((saveState === 'dirty' || saveState === 'saving') && !window.confirm('יש שינויים שטרם נשמרו. לצאת בכל זאת?')) return;
                router.push('/');
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M19 12H5m6 6-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </Tooltip>
          <div className="min-w-0">
            <h1 className="truncate text-ui-base font-bold leading-tight text-studio-ink">{project.name}</h1>
            <p className="truncate text-ui-label text-studio-faint">עודכן {formatRelative(project.updatedAt)}</p>
          </div>
          <StatusPill tone={project.status === 'published' ? 'ok' : project.status === 'review' ? 'warn' : 'neutral'}>
            {STATUS_LABELS[project.status]}
          </StatusPill>
          <ReadinessRing project={project} size={34} onOpen={() => setReadinessOpen(true)} />
        </div>

        <div className="flex items-center gap-1">
          <Tooltip label="ביטול" shortcut="⌘Z">
            <IconButton aria-label="ביטול" disabled={!canUndo} onClick={undo}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 14 4 9l5-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" strokeLinecap="round" />
              </svg>
            </IconButton>
          </Tooltip>
          <Tooltip label="ביצוע חוזר" shortcut="⇧⌘Z">
            <IconButton aria-label="ביצוע חוזר" disabled={!canRedo} onClick={redo}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 14 4 9l5-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" strokeLinecap="round" />
              </svg>
            </IconButton>
          </Tooltip>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mx-1 hidden h-8 items-center gap-2 rounded-lg bg-studio-sunken px-2.5 text-ui-xs text-studio-muted transition-colors hover:bg-studio-raised hover:text-studio-ink tablet:inline-flex"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" strokeLinecap="round" />
            </svg>
            חיפוש ופקודות
            <kbd className="rounded border border-studio-line px-1 font-studio-mono text-[10px]" dir="ltr">⌘K</kbd>
          </button>

          <StatusPill tone={SAVE_TONE[saveState]} className="hidden tablet:inline-flex">{SAVE_LABEL[saveState]}</StatusPill>
          <ThemeToggle />
          <SignOutButton />
          <StudioButton size="sm" variant="secondary" onClick={() => setPresent(true)}>תצוגה מלאה</StudioButton>
          <StudioButton
            size="sm"
            variant="primary"
            onClick={() => { if (saveTimer.current) window.clearTimeout(saveTimer.current); void persist(); }}
            disabled={saveState === 'saving'}
          >
            שמירה
          </StudioButton>
        </div>
      </header>

      {/* ------------------------------------------------- mobile view switch */}
      <div className="shrink-0 border-b border-studio-line bg-studio-panel px-3 py-1.5 desktop:hidden">
        <div role="tablist" aria-label="מצב תצוגה" className="inline-flex w-full rounded-lg bg-studio-sunken p-0.5">
          {(['edit', 'preview'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={mobileView === mode}
              onClick={() => setMobileView(mode)}
              className={cn(
                'h-9 flex-1 rounded-md text-ui-sm font-semibold transition-colors duration-[var(--t-state)]',
                mobileView === mode ? 'bg-studio-panel text-studio-ink shadow-studio-sm' : 'text-studio-muted',
              )}
            >
              {mode === 'edit' ? 'עריכה' : 'תצוגה'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col desktop:flex-row">
        {/* --------------------------------------------- structure navigator */}
        <nav
          aria-label="מבנה העמוד"
          className={cn(
            'studio-scroll shrink-0 overflow-y-auto border-studio-line bg-studio-panel',
            'border-b p-2 desktop:w-[18.5rem] desktop:border-b-0 desktop:border-s desktop:p-3',
            mobileView === 'preview' && 'hidden desktop:block',
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <GroupLabel>מבנה העמוד</GroupLabel>
            <span className="font-studio-mono text-[10px] text-studio-faint" dir="ltr">{sections.length}</span>
          </div>

          {sections.length === 0 ? (
            <EmptyNote title="העמוד ריק">הוסיפו סקשן ראשון כדי להתחיל לבנות.</EmptyNote>
          ) : (
            <SiteStructure
              project={project}
              selectedId={settingsTab ? null : selectedSectionId}
              onSelect={selectSection}
              onReorder={(next) => updateStructural((draft) => withSections(draft, next), 'סידור סקשנים')}
              actions={sectionActions}
            />
          )}

          <div className="mt-2 border-t border-studio-line pt-2">
            <AddSectionPanel
              onAdd={(type) => {
                const created = createSection(type, templateContentFor(project, type));
                updateStructural((draft) => withSections(draft, [...homeSections(draft), created]), 'הוספת סקשן');
                setSelectedSectionId(created.id);
                flash('הסקשן נוסף לסוף העמוד.');
              }}
              onInsertPreset={(section) => {
                updateStructural((draft) => withSections(draft, [...homeSections(draft), section]), 'הוספת פריסט');
                setSelectedSectionId(section.id);
                flash('הפריסט נוסף כסקשן עצמאי.');
              }}
            />
          </div>

          {/* Settings sit visually apart — configured occasionally, not edited. */}
          <div className="mt-3 border-t border-studio-line pt-3">
            <GroupLabel className="px-1">הגדרות הפרויקט</GroupLabel>
            <ul className="mt-1.5 flex flex-col gap-0.5">
              {SETTINGS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => { setSettingsTab(item.id); setMobileView('edit'); }}
                    aria-current={settingsTab === item.id ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-ui-sm font-medium transition-colors duration-[var(--t-state)]',
                      settingsTab === item.id ? 'bg-studio-accent-soft text-studio-accent' : 'text-studio-soft hover:bg-studio-raised hover:text-studio-ink',
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ------------------------------------------------- editor column */}
        <section
          aria-label="פאנל עריכה"
          style={{ ['--w' as string]: `${editorWidth}px` }}
          className={cn(
            'studio-scroll min-h-0 flex-1 overflow-y-auto bg-studio-panel desktop:w-[var(--w)] desktop:flex-none desktop:border-s desktop:border-studio-line',
            mobileView === 'preview' && 'hidden desktop:block',
          )}
        >
          <div key={settingsTab ?? selectedSectionId ?? 'none'} className="studio-enter p-4 desktop:p-5">
            {settingsTab === 'settings-business' && <OverviewPanel project={project} update={update} focus={focus} />}
            {settingsTab === 'settings-design' && <DesignPanel project={project} update={update} />}
            {settingsTab === 'settings-media' && <MediaPanel project={project} update={update} />}
            {settingsTab === 'settings-seo' && <SeoPanel project={project} update={update} />}
            {settingsTab === 'settings-history' && (
              <HistoryPanel project={project} refreshToken={historyToken} onRestore={(restored, label) => updateStructural(() => restored, label)} />
            )}

            {!settingsTab && selected && (
              <div className="flex flex-col gap-5">
                <header className="flex items-start justify-between gap-3 border-b border-studio-line pb-3">
                  <div className="min-w-0">
                    <GroupLabel>עריכת סקשן</GroupLabel>
                    <h2 className="mt-1 truncate text-ui-xl font-bold text-studio-ink">{SECTION_LABELS[selected.type]}</h2>
                  </div>
                  <Menu
                    label="פעולות על הסקשן"
                    items={[
                      { id: 'dup', label: 'שכפול', onSelect: () => sectionActions.duplicate(selected) },
                      { id: 'reset', label: 'איפוס לתבנית', onSelect: () => sectionActions.reset(selected) },
                      { id: 'preset', label: 'שמירה כפריסט', onSelect: () => sectionActions.savePreset(selected) },
                      { id: 'del', label: 'מחיקה', tone: 'danger', onSelect: () => sectionActions.remove(selected) },
                    ]}
                  />
                </header>

                <VariantPicker
                  type={selected.type}
                  value={selected.variant}
                  onChange={(variant) =>
                    updateStructural(
                      (draft) => withSections(draft, homeSections(draft).map((s) => (s.id === selected.id ? { ...s, variant } : s))),
                      'החלפת מראה',
                    )
                  }
                />

                <SectionContentEditor
                  section={selected}
                  setContent={(recipe, coalesceKey) =>
                    update((draft) => ({
                      ...draft,
                      pages: draft.pages.map((page) => ({
                        ...page,
                        sections: page.sections.map((s) => (s.id === selected.id ? { ...s, content: recipe(s.content), updatedAt: new Date().toISOString() } : s)),
                      })),
                    }), { coalesceKey })
                  }
                />
              </div>
            )}

            {!settingsTab && !selected && (
              <EmptyNote title="לא נבחר סקשן">בחרו סקשן מהרשימה כדי לערוך אותו, או הוסיפו סקשן חדש.</EmptyNote>
            )}
          </div>
        </section>

        {/* divider */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="שינוי רוחב פאנל העריכה"
          aria-valuenow={editorWidth}
          aria-valuemin={MIN_EDITOR}
          aria-valuemax={1200}
          tabIndex={0}
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); applyWidth(editorWidth + 24); }
            else if (event.key === 'ArrowRight') { event.preventDefault(); applyWidth(editorWidth - 24); }
            else if (event.key === 'Home') { event.preventDefault(); applyWidth(MIN_EDITOR); }
            else if (event.key === 'End') { event.preventDefault(); applyWidth(window.innerWidth - MIN_PREVIEW); }
            else if (event.key === 'Enter') { event.preventDefault(); applyWidth(DEFAULT_WIDTH); }
          }}
          className={cn(
            'group hidden w-2 shrink-0 cursor-col-resize items-center justify-center bg-studio-canvas transition-colors duration-[var(--t-state)] hover:bg-studio-accent/20 focus-visible:bg-studio-accent/30 desktop:flex',
            mobileView === 'preview' && 'hidden',
          )}
        >
          <span aria-hidden="true" className="h-10 w-1 rounded-full bg-studio-line-strong transition-colors duration-[var(--t-state)] group-hover:bg-studio-accent" />
        </div>

        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', mobileView === 'edit' && 'hidden desktop:flex')}>
          {previewNode}
        </div>
      </div>

      {/* ---------------------------------------------------- presentation */}
      {present && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-studio-canvas" role="dialog" aria-modal="true" aria-label="תצוגה מלאה ללקוח">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-ui-base font-bold text-studio-ink">{project.name}</span>
            <div className="flex items-center gap-2">
              <div className="hidden tablet:block">
                <PresentDeviceSwitch value={preview.device} onChange={(device) => setPreview((v) => ({ ...v, device }))} />
              </div>
              <StudioButton size="sm" onClick={() => setPresent(false)}>סגירה<kbd className="ms-1 font-studio-mono text-[10px] opacity-60" dir="ltr">Esc</kbd></StudioButton>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <PreviewPanel
              chromeless
              project={project}
              settings={{ ...preview, selectMode: false }}
              onSettingsChange={(next) => setPreview((v) => ({ ...v, ...next }))}
              onSelectField={() => {}}
              onSelectSection={() => {}}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- readiness */}
      {readinessOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[8vh]">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setReadinessOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label="מוכנות לפרסום" className="studio-pop studio-scroll relative max-h-[80vh] w-full max-w-[34rem] overflow-y-auto rounded-2xl bg-studio-panel p-5 shadow-studio-lg ring-1 ring-studio-line">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-ui-lg font-bold">מה חסר לפני פרסום</h2>
              <IconButton aria-label="סגירה" onClick={() => setReadinessOpen(false)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
              </IconButton>
            </div>
            <ReadinessChecklist project={project} onFix={fixReadiness} />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- shortcuts */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShortcutsOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label="קיצורי מקלדת" className="studio-pop relative w-full max-w-[26rem] rounded-2xl bg-studio-panel p-5 shadow-studio-lg ring-1 ring-studio-line">
            <h2 className="mb-3 text-ui-lg font-bold">קיצורי מקלדת</h2>
            <ul className="flex flex-col">
              {[
                ['⌘K', 'חיפוש ופקודות'], ['⌘S', 'שמירה'], ['⌘Z', 'ביטול'], ['⇧⌘Z', 'ביצוע חוזר'],
                ['P', 'תצוגה מלאה ללקוח'], ['Esc', 'סגירת חלון'], ['?', 'החלון הזה'],
              ].map(([key, label]) => (
                <li key={key} className="flex items-center justify-between border-b border-studio-line py-2 last:border-0">
                  <span className="text-ui-sm text-studio-soft">{label}</span>
                  <kbd className="rounded border border-studio-line bg-studio-sunken px-1.5 py-0.5 font-studio-mono text-ui-xs" dir="ltr">{key}</kbd>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {toast && (
        <div className="studio-pop pointer-events-none fixed bottom-5 start-1/2 z-[80] -translate-x-1/2 rtl:translate-x-1/2">
          <p className="rounded-full bg-studio-ink px-4 py-2 text-ui-sm font-semibold text-studio-panel shadow-studio-lg">{toast}</p>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </div>
  );
}

function PresentDeviceSwitch({ value, onChange }: { value: PreviewSettings['device']; onChange: (device: PreviewSettings['device']) => void }) {
  return (
    <div role="radiogroup" aria-label="רוחב תצוגה" className="inline-flex rounded-lg bg-studio-sunken p-0.5">
      {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
        <button
          key={device}
          type="button"
          role="radio"
          aria-checked={value === device}
          onClick={() => onChange(device)}
          className={cn(
            'h-8 rounded-md px-3 text-ui-xs font-semibold transition-colors duration-[var(--t-state)]',
            value === device ? 'bg-studio-panel text-studio-ink shadow-studio-sm' : 'text-studio-muted hover:text-studio-ink',
          )}
        >
          {device === 'desktop' ? 'מחשב' : device === 'tablet' ? 'טאבלט' : 'נייד'}
        </button>
      ))}
    </div>
  );
}
