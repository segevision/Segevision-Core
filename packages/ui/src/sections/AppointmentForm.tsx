'use client';

import * as React from 'react';
import { cn } from '@segevision/utils';
import { CheckIcon } from '@segevision/icons';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { Eyebrow } from '../components/Eyebrow';
import { Field, Input, Select, Textarea } from '../components/Field';
import { Reveal } from '../components/Reveal';

export interface AppointmentFormValues {
  fullName: string;
  phone: string;
  topic: string;
  preferredTime: string;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface AppointmentFormCopy {
  fullName: { label: string; placeholder?: string; error: string };
  phone: { label: string; placeholder?: string; hint?: string; error: string };
  topic: { label: string; placeholder: string; error: string; options: SelectOption[] };
  preferredTime: { label: string; placeholder: string; options: SelectOption[] };
  message: { label: string; placeholder?: string; hint?: string };
  submit: string;
  submitting: string;
  success: { title: string; body: string; again: string };
  /** Honest framing: this is a request, not a confirmed booking. */
  disclaimer?: string;
}

export interface AppointmentFormProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  copy: AppointmentFormCopy;
  /** Reassurance points shown beside the form — reduces the cost of pressing submit. */
  assurances?: string[];
  /** Preselects a topic, e.g. when the visitor arrives from the symptom selector. */
  defaultTopic?: string;
  /** Real submit handler. Without one the form runs in demo mode and says so. */
  onSubmit?: (values: AppointmentFormValues) => Promise<void>;
  /** Shown when no onSubmit is wired — never let a concept pretend to be live. */
  demoNotice?: string;
  className?: string;
}

const emptyValues: AppointmentFormValues = {
  fullName: '',
  phone: '',
  topic: '',
  preferredTime: '',
  message: '',
};

/** Accepts the ways Israelis actually type a phone number: spaces, dashes, +972. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  return digits.startsWith('+972') ? `0${digits.slice(4)}` : digits;
}

function isValidPhone(raw: string): boolean {
  const phone = normalizePhone(raw);
  return /^0\d{8,9}$/.test(phone);
}

export function AppointmentForm({
  id,
  eyebrow,
  title,
  lead,
  copy,
  assurances,
  defaultTopic,
  onSubmit,
  demoNotice,
  className,
}: AppointmentFormProps) {
  const [values, setValues] = React.useState<AppointmentFormValues>({
    ...emptyValues,
    topic: defaultTopic ?? '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof AppointmentFormValues, string>>>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
  const successRef = React.useRef<HTMLDivElement>(null);

  const setValue = (key: keyof AppointmentFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  /** Field order here is the DOM order, so "first invalid" means the topmost one. */
  const fieldOrder: (keyof AppointmentFormValues)[] = ['fullName', 'phone', 'topic'];

  const validate = (): Partial<Record<keyof AppointmentFormValues, string>> => {
    const next: Partial<Record<keyof AppointmentFormValues, string>> = {};
    if (values.fullName.trim().length < 2) next.fullName = copy.fullName.error;
    if (!isValidPhone(values.phone)) next.phone = copy.phone.error;
    if (!values.topic) next.topic = copy.topic.error;
    setErrors(next);
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      // Focus the first failed control so keyboard and screen reader users land on
      // the problem instead of hunting for it. The control is located by name rather
      // than by [aria-invalid] because that attribute only appears after React has
      // re-rendered, which has not happened yet at this point in the handler.
      const form = event.currentTarget;
      const firstInvalidKey = fieldOrder.find((key) => validationErrors[key]);
      if (firstInvalidKey) {
        const control = form.elements.namedItem(firstInvalidKey);
        if (control instanceof HTMLElement) control.focus();
      }
      return;
    }
    setStatus('submitting');
    try {
      if (onSubmit) await onSubmit(values);
      else await new Promise((resolve) => setTimeout(resolve, 700));
      setStatus('success');
    } catch {
      setStatus('idle');
      setErrors({ phone: copy.phone.error });
    }
  };

  React.useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  return (
    <section id={id} className={cn('relative isolate overflow-hidden bg-surface-alt py-16 desktop:py-20', className)}>
      <Container>
        <div className="grid gap-10 desktop:grid-cols-12 desktop:gap-16">
          <Reveal className="desktop:col-span-5">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.12] tracking-[-0.02em] text-text-primary desktop:text-5xl">
              {title}
            </h2>
            {lead && <p className="mt-5 font-body text-base leading-relaxed text-text-secondary">{lead}</p>}

            {assurances && assurances.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3">
                {assurances.map((assurance) => (
                  <li key={assurance} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
                    >
                      <CheckIcon size={16} />
                    </span>
                    <span className="font-body text-base leading-relaxed text-text-primary">{assurance}</span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal delay={0.06} className="desktop:col-span-7">
            <div className="rounded-md bg-surface p-6 shadow-e3 ring-1 ring-border desktop:p-9">
              {status === 'success' ? (
                <div
                  ref={successRef}
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="flex flex-col items-start gap-4 focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/12 text-success"
                  >
                    <CheckIcon size={24} />
                  </span>
                  <h3 className="font-display text-2xl font-bold leading-snug text-text-primary">
                    {copy.success.title}
                  </h3>
                  <p className="max-w-[34rem] font-body text-base leading-relaxed text-text-secondary">
                    {copy.success.body}
                  </p>
                  {demoNotice && !onSubmit && (
                    <p className="rounded-md bg-warning/10 px-4 py-3 font-body text-sm leading-relaxed text-text-primary ring-1 ring-inset ring-warning/30">
                      {demoNotice}
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setValues({ ...emptyValues, topic: defaultTopic ?? '' });
                      setStatus('idle');
                    }}
                  >
                    {copy.success.again}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <div className="grid gap-5 tablet:grid-cols-2">
                    <Field label={copy.fullName.label} error={errors.fullName} required>
                      <Input
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder={copy.fullName.placeholder}
                        value={values.fullName}
                        onChange={setValue('fullName')}
                      />
                    </Field>

                    <Field label={copy.phone.label} hint={copy.phone.hint} error={errors.phone} required>
                      <Input
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        dir="ltr"
                        className="text-start"
                        placeholder={copy.phone.placeholder}
                        value={values.phone}
                        onChange={setValue('phone')}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-5 tablet:grid-cols-2">
                    <Field label={copy.topic.label} error={errors.topic} required>
                      <Select name="topic" value={values.topic} onChange={setValue('topic')}>
                        <option value="" disabled>
                          {copy.topic.placeholder}
                        </option>
                        {copy.topic.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label={copy.preferredTime.label}>
                      <Select name="preferredTime" value={values.preferredTime} onChange={setValue('preferredTime')}>
                        <option value="">{copy.preferredTime.placeholder}</option>
                        {copy.preferredTime.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field label={copy.message.label} hint={copy.message.hint}>
                    <Textarea
                      name="message"
                      rows={4}
                      placeholder={copy.message.placeholder}
                      value={values.message}
                      onChange={setValue('message')}
                    />
                  </Field>

                  <div className="mt-1 flex flex-col gap-4">
                    <Button type="submit" size="lg" loading={status === 'submitting'} className="w-full tablet:w-auto">
                      {status === 'submitting' ? copy.submitting : copy.submit}
                    </Button>
                    {copy.disclaimer && (
                      <p className="font-body text-xs leading-relaxed text-text-secondary">{copy.disclaimer}</p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
