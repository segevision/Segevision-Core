'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import type { IconProps } from '@segevision/icons';
import { Container } from '../components/Container';
import { Logo } from '../components/Logo';

export interface FooterLink {
  label: string;
  href: string;
  /** External links get the standard rel treatment automatically. */
  external?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSocial {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
}

export interface FooterContactLine {
  id: string;
  label: string;
  value: string;
  href?: string;
  /** Appends a small "unconfirmed" marker so review builds stay honest. */
  pendingLabel?: string;
}

export interface SiteFooterProps {
  brand: { name: string; src?: string; description?: string };
  columns?: FooterColumn[];
  contact?: { title: string; lines: FooterContactLine[] };
  socials?: FooterSocial[];
  legalLinks?: FooterLink[];
  copyright: string;
  /** Studio credit — kept as structured data rather than a hardcoded string. */
  credit?: { prefix: string; label: string; href: string };
  className?: string;
}

export function SiteFooter({
  brand,
  columns = [],
  contact,
  socials = [],
  legalLinks = [],
  copyright,
  credit,
  className,
}: SiteFooterProps) {
  const linkClass =
    'font-body text-sm text-text-inverse/65 transition-colors duration-fast hover:text-text-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm';

  return (
    <footer
      className={cn('relative isolate overflow-hidden bg-surface-inverse pb-24 pt-20 tablet:pb-14 desktop:pt-24', className)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_100%_0%,hsl(var(--color-brand-primary)/0.30),transparent_60%)]"
      />

      <Container>
        <div className="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
          <div className="desktop:col-span-4">
            <Logo name={brand.name} src={brand.src} size="lg" className="text-text-inverse tracking-[-0.02em]" />
            {brand.description && (
              <p className="mt-5 max-w-[26rem] font-body text-sm leading-relaxed text-text-inverse/65">
                {brand.description}
              </p>
            )}
            {socials.length > 0 && (
              <ul className="mt-7 flex items-center gap-3">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-text-inverse/8 text-text-inverse/80 ring-1 ring-inset ring-text-inverse/15 transition-colors duration-fast hover:bg-text-inverse/15 hover:text-text-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                    >
                      <social.icon size={20} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {columns.map((column) => (
            <nav key={column.id} aria-label={column.title} className="desktop:col-span-2">
              <h2 className="font-display text-sm font-bold text-text-inverse">{column.title}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className={linkClass}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {contact && (
            <div className="desktop:col-span-4">
              <h2 className="font-display text-sm font-bold text-text-inverse">{contact.title}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {contact.lines.map((line) => (
                  <li key={line.id}>
                    {/* /65 not /45: at 12px this label needs 4.5:1 against the ink surface. */}
                    <span className="block font-body text-xs text-text-inverse/65">{line.label}</span>
                    {line.href ? (
                      <a href={line.href} className="mt-1 block font-body text-sm text-text-inverse hover:underline">
                        {line.value}
                      </a>
                    ) : (
                      <span className="mt-1 block font-body text-sm text-text-inverse">{line.value}</span>
                    )}
                    {line.pendingLabel && (
                      <span className="mt-1.5 inline-block rounded-full bg-text-inverse/10 px-2.5 py-0.5 font-body text-[0.6875rem] text-text-inverse/70">
                        {line.pendingLabel}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-text-inverse/12 pt-7 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="font-body text-xs text-text-inverse/50">{copyright}</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a key={link.href + link.label} href={link.href} className={cn(linkClass, 'text-xs')}>
                {link.label}
              </a>
            ))}
            {credit && (
              <p className="font-body text-xs text-text-inverse/50">
                {credit.prefix}{' '}
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-text-inverse/80 hover:text-text-inverse"
                >
                  {credit.label}
                </a>
              </p>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
