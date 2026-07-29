'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { Container } from '../components/Container';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Verified qualifications only — this is the highest-scrutiny copy on a clinic site. */
  credentials?: string[];
  bio?: string;
  photo?: { src?: string; label: string; note?: string };
}

export interface TeamGridProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  members: TeamMember[];
  className?: string;
}

/**
 * Practitioner profiles at portrait scale. A boutique clinic sells the specific
 * people in the room, so the photograph is given real estate rather than being
 * reduced to a avatar circle in a list.
 */
export function TeamGrid({ id, eyebrow, title, lead, members, className }: TeamGridProps) {
  return (
    <section id={id} className={cn('bg-surface py-16 desktop:py-20', className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />

        <ul className="mt-10 grid gap-6 tablet:grid-cols-2 desktop:gap-8">
          {members.map((member, index) => (
            <Reveal as="li" key={member.id} delay={index * 0.08}>
              <article className="group h-full overflow-hidden rounded-md bg-surface-alt ring-1 ring-border transition-shadow duration-base ease-out hover:shadow-e3">
                {member.photo && (
                  <ImagePlaceholder
                    label={member.photo.label}
                    note={member.photo.note}
                    src={member.photo.src}
                    alt={member.name}
                    ratio="4 / 3"
                    tone="ink"
                    className="rounded-none ring-0"
                  />
                )}
                <div className="p-7 desktop:p-8">
                  <h3 className="font-display text-2xl font-bold leading-snug tracking-[-0.01em] text-text-primary">
                    {member.name}
                  </h3>
                  <p className="mt-1.5 font-body text-sm font-semibold text-brand-primary">{member.role}</p>

                  {member.bio && (
                    <p className="mt-4 font-body text-base leading-relaxed text-text-secondary">{member.bio}</p>
                  )}

                  {member.credentials && member.credentials.length > 0 && (
                    <ul className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
                      {member.credentials.map((credential) => (
                        <li key={credential} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span className="font-body text-sm leading-relaxed text-text-primary">{credential}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
