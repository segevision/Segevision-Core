'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { DropdownMenu, Tooltip as FloatingTooltip } from './floating';

/**
 * Studio primitives.
 *
 * Deliberately not built on @segevision/ui: that library is the product we ship to
 * clients, and binding the editor chrome to it would let a client's theme restyle the
 * tool that edits it.
 *
 * The single most consequential decision here is that inputs are *filled*, not
 * outlined. The previous build drew a border around every field, which put 74 boxes
 * on one screen. A recessed fill carries the same affordance with none of the noise,
 * and lets the border mean something — hover and focus.
 */

/* ---------------------------------------------------------------- buttons */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type Size = 'xs' | 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--t-state)] ease-studio disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-studio-accent text-studio-accent-ink shadow-studio-sm hover:brightness-110',
  secondary:
    'bg-studio-panel text-studio-ink ring-1 ring-inset ring-studio-line hover:ring-studio-line-strong hover:bg-studio-raised',
  ghost: 'text-studio-soft hover:bg-studio-raised hover:text-studio-ink',
  subtle: 'bg-studio-sunken text-studio-soft hover:bg-studio-raised hover:text-studio-ink',
  danger: 'bg-studio-danger/10 text-studio-danger hover:bg-studio-danger/16',
};

const sizes: Record<Size, string> = {
  xs: 'h-7 px-2 text-ui-xs',
  sm: 'h-8 px-2.5 text-ui-sm',
  md: 'h-10 px-4 text-ui-base',
};

export interface StudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const StudioButton = React.forwardRef<HTMLButtonElement, StudioButtonProps>(
  ({ variant = 'secondary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);
StudioButton.displayName = 'StudioButton';

export function StudioLink({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size }) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

/** Square icon button. Always paired with a Tooltip — never a bare glyph. */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: Size; active?: boolean }
>(({ size = 'sm', active, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      base,
      /*
       * The visual box stays compact, but a pseudo-element extends the hit area to at
       * least 44x44 on coarse pointers. Growing the button itself would have pushed every
       * toolbar apart; growing only what the finger has to find costs no layout.
       */
      'relative touch:after:absolute touch:after:left-1/2 touch:after:top-1/2 touch:after:h-11 touch:after:w-11 touch:after:-translate-x-1/2 touch:after:-translate-y-1/2 touch:after:content-[""]',
      size === 'xs' ? 'h-7 w-7' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
      active
        ? 'bg-studio-accent-soft text-studio-accent'
        : 'text-studio-muted hover:bg-studio-raised hover:text-studio-ink',
      className,
    )}
    {...props}
  />
));
IconButton.displayName = 'IconButton';

/* --------------------------------------------------------------- tooltip */

/**
 * Tooltip. Signature unchanged; positioning now comes from ./floating.
 *
 * The old version centred itself with `start-1/2 translate-x-1/2` and an RTL override that
 * pushed it the wrong way, so in this RTL document every tooltip sat a half-width off its
 * trigger. It was also `absolute`, so the ones inside a project card were clipped by the
 * card. Both problems disappear with portal + real measurement.
 */
export function Tooltip({
  label,
  shortcut,
  children,
  side = 'bottom',
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
  side?: 'bottom' | 'top';
}) {
  return (
    <FloatingTooltip label={label} shortcut={shortcut} placement={side}>
      {children}
    </FloatingTooltip>
  );
}

/* ----------------------------------------------------------------- panel */

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-ui-lg font-bold text-studio-ink">{title}</h2>}
            {description && (
              <p className="mt-1 max-w-[52ch] text-ui-sm leading-relaxed text-studio-muted">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Section heading inside a panel — the rung between panel title and field label. */
export function GroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-ui-label font-bold uppercase tracking-wider text-studio-faint',
        className,
      )}
    >
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------- fields */

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-ui-sm font-semibold text-studio-soft">
        {label}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, { id })
        : children}
      {hint && !error && (
        <span className="text-ui-xs leading-relaxed text-studio-faint">{hint}</span>
      )}
      {error && <span className="text-ui-xs font-medium text-studio-danger">{error}</span>}
    </div>
  );
}

/* Filled, not outlined. The border appears on hover and focus, where it means something. */
const control =
  'w-full rounded-lg bg-studio-sunken px-3 text-ui-base text-studio-ink placeholder:text-studio-faint ' +
  'ring-1 ring-inset ring-transparent transition-[background-color,box-shadow] duration-[var(--t-state)] ease-studio ' +
  'hover:bg-studio-raised hover:ring-studio-line focus:bg-studio-panel focus:ring-studio-accent focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-55';

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(control, 'h-10', className)} {...props} />
));
TextInput.displayName = 'TextInput';

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(control, 'resize-y py-2.5 leading-relaxed', className)}
    {...props}
  />
));
TextArea.displayName = 'TextArea';

export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(control, 'h-10 cursor-pointer appearance-none pe-9', className)}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-studio-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
SelectInput.displayName = 'SelectInput';

export function ColorInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  const commit = (next: string) => {
    const normalized = next.startsWith('#') ? next : `#${next}`;
    setDraft(normalized);
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) onChange(normalized.toUpperCase());
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-studio-line">
        <input
          id={id}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(draft) ? draft : '#000000'}
          onChange={(event) => commit(event.target.value)}
          className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0"
          aria-label="בחירת צבע"
        />
      </span>
      <input
        value={draft}
        onChange={(event) => commit(event.target.value)}
        dir="ltr"
        spellCheck={false}
        className={cn(control, 'h-10 text-start font-studio-mono text-ui-sm uppercase')}
      />
    </div>
  );
}

/* -------------------------------------------------------------- segmented */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode; title?: string }[];
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex rounded-lg bg-studio-sunken p-0.5 ring-1 ring-inset ring-studio-line',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[6px] font-semibold transition-[background-color,color,box-shadow] duration-[var(--t-state)] ease-studio',
              size === 'sm' ? 'h-7 px-2.5 text-ui-xs' : 'h-8 px-3 text-ui-sm',
              active
                ? 'bg-studio-panel text-studio-ink shadow-studio-sm'
                : 'text-studio-muted hover:text-studio-ink',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ misc */

export function StatusPill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'ok' | 'warn' | 'accent' | 'danger';
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: 'bg-studio-sunken text-studio-muted ring-studio-line',
    ok: 'bg-studio-ok/12 text-studio-ok ring-studio-ok/25',
    warn: 'bg-studio-warn/12 text-studio-warn ring-studio-warn/25',
    accent: 'bg-studio-accent-soft text-studio-accent ring-studio-accent/25',
    danger: 'bg-studio-danger/12 text-studio-danger ring-studio-danger/25',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-ui-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * `tone="quiet"` is for lists where nearly every switch is on — the section rail, most
 * of all. Fifteen accent-coloured switches read as fifteen alerts, and they compete with
 * the accent that marks the selected row. Quiet keeps on/off legible without the shouting.
 */
export function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
  tone = 'accent',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  size?: 'sm' | 'md';
  tone?: 'accent' | 'quiet';
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative shrink-0 rounded-full transition-colors duration-[var(--t-state)] ease-studio',
        size === 'sm' ? 'h-4 w-7' : 'h-5 w-9',
        checked
          ? tone === 'quiet'
            ? 'bg-studio-soft'
            : 'bg-studio-accent'
          : 'bg-studio-line-strong',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 rounded-full bg-white shadow-studio-sm transition-all duration-[var(--t-state)] ease-studio',
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
          checked ? (size === 'sm' ? 'end-0.5' : 'end-0.5') : size === 'sm' ? 'end-3.5' : 'end-4.5',
        )}
      />
    </button>
  );
}

/** Overflow menu. Replaces the row of equal-weight buttons the previous build used. */
/**
 * The three-dot action menu.
 *
 * The call signature is unchanged; the implementation is now DropdownMenu from
 * ./floating, which renders through a portal with real collision detection. The previous
 * version positioned itself `absolute` inside its parent, which meant the project card's
 * `overflow-hidden` clipped it away entirely and it always opened downward regardless of
 * remaining space. See components/floating.tsx for why a portal — not `position: fixed` —
 * was the only workable fix.
 */
export function Menu({
  label,
  items,
  align = 'end',
}: {
  label: string;
  items: {
    id: string;
    label: string;
    onSelect: () => void;
    tone?: 'default' | 'danger';
    hint?: string;
  }[];
  align?: 'start' | 'end';
}) {
  return (
    <DropdownMenu
      label={label}
      items={items}
      placement={align === 'end' ? 'bottom-end' : 'bottom-start'}
      trigger={({ ref, open, props }) => (
        <IconButton
          ref={ref as React.Ref<HTMLButtonElement>}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          active={open}
          {...props}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </IconButton>
      )}
    />
  );
}

export function RepeaterItem({
  title,
  onRemove,
  removeLabel = 'הסרה',
  children,
}: {
  title: string;
  onRemove?: () => void;
  removeLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-studio-sunken/60 p-3 transition-colors duration-[var(--t-state)] hover:bg-studio-sunken">
      <div className="flex items-center justify-between gap-3">
        <GroupLabel>{title}</GroupLabel>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md px-1.5 py-0.5 text-ui-xs font-semibold text-studio-faint transition-colors hover:bg-studio-danger/10 hover:text-studio-danger"
          >
            {removeLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function EmptyNote({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-studio-line bg-studio-sunken/50 px-5 py-8 text-center">
      {title && <p className="text-ui-base font-bold text-studio-ink">{title}</p>}
      <p className="max-w-[38ch] text-ui-sm leading-relaxed text-studio-muted">{children}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('studio-skeleton rounded-md', className)} aria-hidden="true" />;
}
