'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@segevision/utils';
import { usePrefersReducedMotion } from '@segevision/hooks';
import { MinusIcon, PlusIcon } from '@segevision/icons';
import { Badge } from '../components/Badge';
import { Container } from '../components/Container';
import { Eyebrow } from '../components/Eyebrow';
import { Reveal } from '../components/Reveal';

export interface FAQItem {
  id: string;
  question: string;
  /** Each string renders as its own paragraph. */
  answer: string[];
  /** Marks an answer the client has not confirmed yet — surfaced, never hidden. */
  pending?: boolean;
  pendingLabel?: string;
  editPaths?: { question?: string; answer?: string };
}

export interface FAQSectionProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  items: FAQItem[];
  /** Slot beside the heading — typically a "still have questions?" contact prompt. */
  aside?: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

/**
 * Disclosure list with a sticky heading column. Uses button + aria-expanded +
 * region rather than <details>, so the open state can be controlled (single-open
 * by default, which stops the page from growing under the reader's thumb) and the
 * height transition can be disabled under prefers-reduced-motion.
 */
export function FAQSection({
  id,
  eyebrow,
  title,
  lead,
  items,
  aside,
  allowMultiple = false,
  defaultOpenId,
  className,
}: FAQSectionProps) {
  const reduced = usePrefersReducedMotion();
  const [openIds, setOpenIds] = React.useState<string[]>(defaultOpenId ? [defaultOpenId] : []);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const toggle = (itemId: string) => {
    setOpenIds((current) => {
      const isOpen = current.includes(itemId);
      if (isOpen) return current.filter((value) => value !== itemId);
      return allowMultiple ? [...current, itemId] : [itemId];
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const focusAt = (next: number) => {
      event.preventDefault();
      buttonRefs.current[(next + items.length) % items.length]?.focus();
    };
    if (event.key === 'ArrowDown') focusAt(index + 1);
    else if (event.key === 'ArrowUp') focusAt(index - 1);
    else if (event.key === 'Home') focusAt(0);
    else if (event.key === 'End') focusAt(items.length - 1);
  };

  return (
    <section id={id} className={cn('bg-surface-alt py-16 desktop:py-20', className)}>
      <Container>
        <div className="grid gap-10 desktop:grid-cols-12 desktop:gap-16">
          <div className="desktop:col-span-4">
            <div className="desktop:sticky desktop:top-28">
              <Reveal>
                {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.12] tracking-[-0.02em] text-text-primary desktop:text-5xl">
                  {title}
                </h2>
                {lead && (
                  <p className="mt-5 font-body text-base leading-relaxed text-text-secondary">{lead}</p>
                )}
                {aside && <div className="mt-8">{aside}</div>}
              </Reveal>
            </div>
          </div>

          <div className="desktop:col-span-8">
            <ul className="flex flex-col">
              {items.map((item, index) => {
                const isOpen = openIds.includes(item.id);
                return (
                  <li key={item.id} className="border-b border-border first:border-t">
                    <h3>
                      <button
                        ref={(node) => {
                          buttonRefs.current[index] = node;
                        }}
                        type="button"
                        onClick={() => toggle(item.id)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${item.id}`}
                        id={`faq-button-${item.id}`}
                        className="flex w-full items-start justify-between gap-6 py-6 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                      >
                        <span
                          data-edit-path={item.editPaths?.question}
                          className="font-display text-lg font-bold leading-snug text-text-primary desktop:text-xl"
                        >
                          {item.question}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-fast',
                            isOpen
                              ? 'bg-brand-primary text-text-inverse'
                              : 'bg-surface text-text-secondary ring-1 ring-border',
                          )}
                        >
                          {isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                        </span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          id={`faq-panel-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-button-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={
                            reduced ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
                          }
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 pb-7 pe-14" data-edit-path={item.editPaths?.answer}>
                            {item.pending && (
                              <Badge variant="outline">{item.pendingLabel ?? 'ממתין לאישור הלקוח'}</Badge>
                            )}
                            {item.answer.map((paragraph) => (
                              <p
                                key={paragraph}
                                className="max-w-[42rem] font-body text-base leading-relaxed text-text-secondary"
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
