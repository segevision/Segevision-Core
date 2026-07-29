'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Button } from '../../components/Button';
import type { HeroAction, HeroCredential, HeroTitleLine } from './types';

/**
 * Pieces every hero variant shares.
 *
 * Keeping the title, actions and credential rendering here is what stops four
 * variants from drifting into four different accessibility and edit-path behaviours.
 */

export const toneClasses = {
  onInk: { default: 'text-text-inverse', muted: 'text-text-inverse/55', accent: 'text-accent' },
  onSurface: { default: 'text-text-primary', muted: 'text-text-secondary', accent: 'text-brand-primary' },
} as const;

export function HeroTitle({
  lines,
  tones,
  className,
}: {
  lines: HeroTitleLine[];
  tones: (typeof toneClasses)['onInk'] | (typeof toneClasses)['onSurface'];
  className?: string;
}) {
  return (
    <h1 className={cn('font-display font-extrabold', className)}>
      {lines.map((line, index) => (
        <span
          key={`${line.text}-${index}`}
          data-edit-path={line.editPath}
          className={cn('block', tones[line.tone ?? 'default'], index > 0 && 'mt-1')}
        >
          {line.text}
        </span>
      ))}
    </h1>
  );
}

export function HeroActions({
  actions,
  onInk,
  className,
}: {
  actions: HeroAction[];
  onInk: boolean;
  className?: string;
}) {
  if (actions.length === 0) return null;
  return (
    <div className={cn('flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:items-center', className)}>
      {actions.map((action) => (
        <Button
          key={action.href + action.label}
          asChild
          size="lg"
          variant={action.variant ?? 'primary'}
          data-edit-path={action.editPath}
          className={cn(
            'w-full tablet:w-auto',
            onInk &&
              action.variant === 'secondary' &&
              'border-text-inverse/25 bg-text-inverse/5 text-text-inverse hover:border-text-inverse/50 hover:bg-text-inverse/10',
            onInk && action.variant === 'ghost' && 'text-text-inverse hover:bg-text-inverse/10',
          )}
        >
          <a href={action.href} aria-label={action.ariaLabel}>
            {action.icon && <action.icon size={20} aria-hidden="true" />}
            {action.label}
          </a>
        </Button>
      ))}
    </div>
  );
}

export function HeroCredentials({
  credentials,
  onInk,
  className,
}: {
  credentials: HeroCredential[];
  onInk: boolean;
  className?: string;
}) {
  if (credentials.length === 0) return null;
  return (
    <ul
      className={cn(
        'flex flex-col gap-x-8 gap-y-3 border-t pt-7 tablet:flex-row tablet:flex-wrap',
        onInk ? 'border-text-inverse/10' : 'border-border',
        className,
      )}
    >
      {credentials.map((credential) => (
        <li
          key={credential.label}
          className={cn('flex items-center gap-2.5', onInk ? 'text-text-inverse/75' : 'text-text-secondary')}
        >
          {credential.icon && (
            <credential.icon size={20} aria-hidden="true" className={onInk ? 'text-accent' : 'text-brand-primary'} />
          )}
          <span className="font-body text-sm leading-snug">{credential.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Layered radial wash used by the ink-grounded variants. */
export function InkBackdrop({ grid = true }: { grid?: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_85%_-10%,hsl(var(--color-brand-primary)/0.55),transparent_60%),radial-gradient(80%_70%_at_5%_100%,hsl(var(--color-accent)/0.22),transparent_65%)]"
      />
      {grid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(100%_80%_at_50%_0%,black,transparent_70%)]"
        />
      )}
    </>
  );
}
