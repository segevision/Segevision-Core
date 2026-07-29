'use client';

import * as React from 'react';
import {
  AppointmentForm,
  ContactSection,
  FAQSection,
  FeatureGrid,
  HeroSection,
  ImagePlaceholder,
  MobileContactBar,
  ProcessTimeline,
  RTLProvider,
  ServiceGrid,
  SiteFooter,
  SiteHeader,
  TeamGrid,
  ThemeProvider,
  TrustStrip,
  type ContactChannel,
  type FAQItem,
  type HeroAction,
  type HeroCredential,
  type HeroVariant,
  type ServicesVariant,
  type TrustVariant,
} from '@segevision/ui';
import {
  ActivityIcon,
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  DumbbellIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparkIcon,
  StethoscopeIcon,
  TargetIcon,
  UsersIcon,
  WhatsAppIcon,
} from '@segevision/icons';
import { homeSections, mediaFor, type Project, type SectionInstance } from './schema';
import { editPath } from './field-registry';
import { buildProjectThemeCss } from './theme';

/**
 * Config-driven website renderer.
 *
 * There is exactly one of these. A template is a different *order and variant* of
 * section instances over the same renderer — never a second codebase — and each
 * instance carries its own content, so two hero sections on one page can differ
 * completely.
 */

const SERVICE_ICONS = [StethoscopeIcon, ActivityIcon, TargetIcon, ShieldCheckIcon, DumbbellIcon, SparkIcon];
const TRUST_ICONS = [CalendarIcon, AwardIcon, BookOpenIcon, ShieldCheckIcon];
const FEATURE_ICONS = [AwardIcon, UsersIcon, ActivityIcon, MapPinIcon];

const nonEmpty = (value: string | undefined | null): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** A phone number is only linkable once it exists; otherwise the CTA is a scroll target. */
function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '#contact';
}

function waHref(whatsapp: string): string {
  const digits = whatsapp.replace(/[^\d]/g, '');
  if (!digits) return '#contact';
  const international = digits.startsWith('0') ? `972${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export interface WebsiteRendererProps {
  project: Project;
  /** Preview mode enables the click-to-edit overlay contract. */
  preview?: boolean;
}

export function WebsiteRenderer({ project, preview = false }: WebsiteRendererProps) {
  const { business, navigation } = project;
  const sections = homeSections(project).filter((section) => section.enabled);

  const hasPhone = nonEmpty(business.phone);
  const hasWhatsapp = nonEmpty(business.whatsapp);

  /** The first hero drives the header CTA and the mobile bar label. */
  const leadHero = sections.find((section) => section.type === 'hero');
  const heroCta = leadHero?.content.hero;

  const heroCredentials: HeroCredential[] = (
    [
      nonEmpty(business.foundedYear)
        ? { icon: CalendarIcon, label: `פועלים משנת ${business.foundedYear}` }
        : null,
      nonEmpty(business.location) ? { icon: MapPinIcon, label: business.location } : null,
      nonEmpty(business.tagline) ? { icon: AwardIcon, label: business.tagline } : null,
    ] as (HeroCredential | null)[]
  ).filter((item): item is HeroCredential => item !== null);

  const contactChannels = (sectionId: string): ContactChannel[] =>
    (
      [
        nonEmpty(business.address) || nonEmpty(business.location)
          ? {
              id: 'address',
              icon: MapPinIcon,
              label: 'כתובת',
              value: business.address || business.location,
              editPath: editPath(sectionId, 'business.address'),
            }
          : null,
        {
          id: 'phone',
          icon: PhoneIcon,
          label: 'טלפון',
          value: hasPhone ? business.phone : 'טרם הוזן',
          href: hasPhone ? telHref(business.phone) : undefined,
          pending: !hasPhone,
          pendingLabel: 'ממתין לפרטים',
          editPath: editPath(sectionId, 'business.phone'),
        },
        {
          id: 'whatsapp',
          icon: WhatsAppIcon,
          label: 'וואטסאפ',
          value: hasWhatsapp ? 'שליחת הודעה' : 'טרם הוזן',
          href: hasWhatsapp ? waHref(business.whatsapp) : undefined,
          pending: !hasWhatsapp,
          pendingLabel: 'ממתין לפרטים',
        },
        nonEmpty(business.email)
          ? {
              id: 'email',
              icon: MailIcon,
              label: 'דוא״ל',
              value: business.email,
              href: `mailto:${business.email}`,
              editPath: editPath(sectionId, 'business.email'),
            }
          : null,
      ] as (ContactChannel | null)[]
    ).filter((channel): channel is ContactChannel => channel !== null);

  const renderSection = (section: SectionInstance): React.ReactNode => {
    const { id, type, variant, content } = section;
    const ep = (path: string) => editPath(id, path);

    switch (type) {
      case 'header':
        return (
          <SiteHeader
            overlay={leadHero?.variant !== 'editorial' && leadHero?.variant !== 'minimal'}
            brand={{ name: business.displayName, href: '#hero', tagline: business.tagline || undefined }}
            items={navigation.map((item) => ({ label: item.label, href: item.href }))}
            primaryAction={
              nonEmpty(heroCta?.primaryCtaLabel)
                ? { label: heroCta!.primaryCtaLabel, href: heroCta!.primaryCtaHref }
                : undefined
            }
            secondaryAction={
              hasPhone ? { label: business.phone, href: telHref(business.phone), icon: PhoneIcon } : undefined
            }
          />
        );

      case 'hero': {
        const hero = content.hero;
        if (!hero) return null;
        const media = mediaFor(project, `hero:${id}`);
        const actions: HeroAction[] = [];

        if (nonEmpty(hero.primaryCtaLabel)) {
          actions.push({
            label: hero.primaryCtaLabel,
            href: hero.primaryCtaHref,
            editPath: ep('content.hero.primaryCtaLabel'),
          });
        }
        if (nonEmpty(hero.secondaryCtaLabel)) {
          actions.push({
            label: hero.secondaryCtaLabel,
            href: hasWhatsapp ? waHref(business.whatsapp) : hero.secondaryCtaHref,
            variant: 'secondary',
            icon: hasWhatsapp ? WhatsAppIcon : undefined,
            editPath: ep('content.hero.secondaryCtaLabel'),
          });
        }
        if (hasPhone) {
          actions.push({
            label: business.phone,
            href: telHref(business.phone),
            variant: 'ghost',
            icon: PhoneIcon,
            ariaLabel: `התקשרו אלינו: ${business.phone}`,
          });
        }

        return (
          <HeroSection
            id="hero"
            variant={variant as HeroVariant}
            eyebrow={hero.eyebrow || undefined}
            titleLines={[
              {
                text: hero.headline || business.displayName,
                tone: 'default',
                editPath: ep('content.hero.headline'),
              },
              ...(nonEmpty(hero.headlineSecondary)
                ? [
                    {
                      text: hero.headlineSecondary,
                      tone: 'muted' as const,
                      editPath: ep('content.hero.headlineSecondary'),
                    },
                  ]
                : []),
            ]}
            lead={hero.subheadline || undefined}
            editPaths={{ eyebrow: ep('content.hero.eyebrow'), lead: ep('content.hero.subheadline') }}
            actions={actions}
            credentials={heroCredentials}
            media={
              variant !== 'minimal' && (media || nonEmpty(hero.mediaLabel)) ? (
                <ImagePlaceholder
                  label={hero.mediaLabel || 'תמונת אזור הפתיחה'}
                  note={hero.mediaNote || undefined}
                  src={media?.src}
                  alt={media?.alt || media?.label || undefined}
                  ratio="4 / 5"
                  tone="ink"
                  className="ring-text-inverse/15"
                />
              ) : undefined
            }
          />
        );
      }

      case 'trust': {
        const points = content.trustPoints ?? [];
        if (points.length === 0) return null;
        return (
          <TrustStrip
            variant={variant as TrustVariant}
            overlap={variant === 'strip'}
            items={points.map((point, index) => ({
              icon: TRUST_ICONS[index % TRUST_ICONS.length],
              title: point.title,
              description: point.description || undefined,
              editPath: index === 0 ? ep('content.trustPoints.0.title') : undefined,
            }))}
          />
        );
      }

      case 'services': {
        const services = content.services ?? [];
        if (services.length === 0) return null;
        return (
          <ServiceGrid
            id="services"
            variant={variant as ServicesVariant}
            eyebrow={content.heading?.eyebrow || undefined}
            title={content.heading?.title || 'השירותים שלנו'}
            lead={content.heading?.lead || undefined}
            editPaths={{ title: ep('content.heading.title') }}
            items={services.map((service, index) => ({
              id: service.id,
              title: service.title,
              description: service.description,
              icon: SERVICE_ICONS[index % SERVICE_ICONS.length],
              tags: service.tags.filter(Boolean),
              action: { label: 'לפרטים נוספים', href: '#appointment' },
              editPaths:
                index === 0
                  ? {
                      title: ep('content.services.0.title'),
                      description: ep('content.services.0.description'),
                    }
                  : undefined,
            }))}
          />
        );
      }

      case 'process': {
        const steps = content.process ?? [];
        if (steps.length === 0) return null;
        return (
          <ProcessTimeline
            id="process"
            eyebrow={content.heading?.eyebrow || undefined}
            title={content.heading?.title || 'איך זה עובד'}
            lead={content.heading?.lead || undefined}
            steps={steps.map((step) => ({
              id: step.id,
              title: step.title,
              description: step.description,
              outcome: step.outcome || undefined,
            }))}
          />
        );
      }

      case 'features': {
        const features = content.features ?? [];
        if (features.length === 0) return null;
        return (
          <FeatureGrid
            id="features"
            eyebrow={content.heading?.eyebrow || undefined}
            title={content.heading?.title || 'למה אנחנו'}
            lead={content.heading?.lead || undefined}
            columns={features.length >= 4 ? 4 : 3}
            items={features.map((feature, index) => ({
              id: feature.id,
              title: feature.title,
              description: feature.description,
              icon: FEATURE_ICONS[index % FEATURE_ICONS.length],
            }))}
          />
        );
      }

      case 'team': {
        const team = content.team ?? [];
        if (team.length === 0) return null;
        return (
          <TeamGrid
            id="team"
            eyebrow={content.heading?.eyebrow || undefined}
            title={content.heading?.title || 'הצוות'}
            lead={content.heading?.lead || undefined}
            members={team.map((member) => {
              const photo = mediaFor(project, `team:${id}:${member.id}`);
              return {
                id: member.id,
                name: member.name,
                role: member.role,
                bio: member.bio || undefined,
                credentials: member.credentials.filter(Boolean),
                photo: photo
                  ? { label: photo.alt || member.photoLabel || member.name, src: photo.src }
                  : nonEmpty(member.photoLabel)
                    ? { label: member.photoLabel }
                    : undefined,
              };
            })}
          />
        );
      }

      case 'faq': {
        const faq = content.faq ?? [];
        if (faq.length === 0) return null;
        const items: FAQItem[] = faq.map((item, index) => ({
          id: item.id,
          question: item.question,
          answer: item.answer.split('\n').map((line) => line.trim()).filter(Boolean),
          pending: item.pending,
          editPaths:
            index === 0
              ? { question: ep('content.faq.0.question'), answer: ep('content.faq.0.answer') }
              : undefined,
        }));
        return (
          <FAQSection
            id="faq"
            eyebrow={content.heading?.eyebrow || undefined}
            title={content.heading?.title || 'שאלות נפוצות'}
            lead={content.heading?.lead || undefined}
            items={items}
            defaultOpenId={items[0]?.id}
          />
        );
      }

      case 'contact': {
        const map = mediaFor(project, `map:${id}`);
        return (
          <ContactSection
            id="contact"
            eyebrow={content.heading?.eyebrow || undefined}
            title={content.heading?.title || 'יצירת קשר'}
            lead={content.heading?.lead || undefined}
            channels={contactChannels(id)}
            hoursTitle={business.hours.length ? 'שעות פעילות' : undefined}
            hours={business.hours.map((row) => ({ days: row.days, hours: row.hours }))}
            hoursNote={business.hoursNote || undefined}
            map={
              <ImagePlaceholder
                label="מפת הגעה"
                note={map ? undefined : 'מפה חיה תוטמע לאחר אימות הכתובת המדויקת.'}
                src={map?.src}
                alt={map?.alt || map?.label || undefined}
                ratio="16 / 10"
                tone="brand"
                badge="ממתין לאימות כתובת"
                className="h-full"
              />
            }
          />
        );
      }

      case 'appointment': {
        const form = content.appointment;
        if (!form) return null;
        const services = sections.flatMap((item) => item.content.services ?? []);
        const topicOptions = services.length
          ? services.map((service) => ({ value: service.id, label: service.title }))
          : [{ value: 'general', label: 'פנייה כללית' }];

        return (
          <AppointmentForm
            id="appointment"
            eyebrow={form.eyebrow || undefined}
            title={form.title || 'נשמח לשמוע מכם'}
            lead={form.lead || undefined}
            assurances={form.assurances.filter(Boolean)}
            demoNotice={
              nonEmpty(form.destination)
                ? undefined
                : 'הערה לגרסת ההדגמה: הטופס עדיין לא מחובר ליעד שליחה, ולכן הפנייה לא נשלחה בפועל.'
            }
            copy={{
              fullName: { label: 'שם מלא', placeholder: 'איך לפנות אליכם?', error: 'נשמח לדעת איך קוראים לכם' },
              phone: {
                label: 'טלפון',
                placeholder: '050-0000000',
                hint: 'לשם החזרה אליכם בלבד',
                error: 'נראה שנפלה טעות במספר. אפשר לבדוק שוב?',
              },
              topic: {
                label: 'נושא הפנייה',
                placeholder: 'בחרו נושא',
                error: 'בחרו נושא כדי שנדע למי להעביר את הפנייה',
                options: topicOptions,
              },
              preferredTime: {
                label: 'מתי נוח שנחזור אליכם?',
                placeholder: 'לא משנה, מתי שנוח לכם',
                options: [
                  { value: 'morning', label: 'בבוקר' },
                  { value: 'noon', label: 'בצהריים' },
                  { value: 'afternoon', label: 'אחר הצהריים' },
                  { value: 'evening', label: 'בערב' },
                ],
              },
              message: { label: 'רוצים להוסיף משהו?', hint: 'לא חובה' },
              submit: form.submitLabel || 'שליחת בקשה',
              submitting: 'שולחים…',
              success: {
                title: form.successTitle || 'הבקשה נקלטה',
                body: form.successBody || 'נחזור אליכם בהקדם לתיאום מועד.',
                again: 'שליחת בקשה נוספת',
              },
              disclaimer: form.disclaimer || undefined,
            }}
          />
        );
      }

      case 'mobileBar':
        return (
          <MobileContactBar
            actions={[
              hasPhone ? { id: 'call', label: 'התקשרו', href: telHref(business.phone), icon: PhoneIcon } : null,
              hasWhatsapp
                ? { id: 'whatsapp', label: 'וואטסאפ', href: waHref(business.whatsapp), icon: WhatsAppIcon }
                : null,
              {
                id: 'appointment',
                label: heroCta?.primaryCtaLabel || 'צרו קשר',
                href: '#appointment',
                icon: CalendarIcon,
                emphasis: true,
              },
            ].filter((action): action is NonNullable<typeof action> => action !== null)}
          />
        );

      case 'footer': {
        const footer = content.footer;
        return (
          <SiteFooter
            brand={{ name: business.displayName, description: footer?.description || undefined }}
            columns={
              navigation.length
                ? [
                    {
                      id: 'nav',
                      title: 'ניווט',
                      links: navigation.map((item) => ({ label: item.label, href: item.href })),
                    },
                  ]
                : []
            }
            contact={{
              title: 'יצירת קשר',
              lines: [
                nonEmpty(business.address) || nonEmpty(business.location)
                  ? { id: 'address', label: 'כתובת', value: business.address || business.location }
                  : null,
                hasPhone
                  ? { id: 'phone', label: 'טלפון', value: business.phone, href: telHref(business.phone) }
                  : { id: 'phone', label: 'טלפון', value: 'טרם הוזן', pendingLabel: 'ממתין לפרטים' },
              ].filter((line): line is NonNullable<typeof line> => line !== null),
            }}
            copyright={
              footer?.copyright || `כל הזכויות שמורות ל${business.displayName}, ${new Date().getFullYear()}`
            }
            credit={{
              prefix: footer?.creditPrefix ?? 'עיצוב ופיתוח:',
              label: footer?.creditLabel ?? 'Segevision',
              href: footer?.creditHref ?? 'https://segevision.com',
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <ThemeProvider
      key={`${project.theme}-${project.design.backgroundMode}`}
      defaultTheme={project.theme}
      defaultMode={project.design.backgroundMode}
    >
      <RTLProvider key={project.direction} defaultDirection={project.direction}>
        <style dangerouslySetInnerHTML={{ __html: buildProjectThemeCss(project) }} />
        <div id="main" data-preview={preview ? 'true' : undefined}>
          {sections.map((section) => (
            // The wrapper carries the instance id so the preview can attribute a click
            // to the right section even when two instances of a type sit on one page.
            <div key={section.id} data-section-id={section.id} data-section-type={section.type}>
              {renderSection(section)}
            </div>
          ))}
        </div>
      </RTLProvider>
    </ThemeProvider>
  );
}

/** Imperative entry point, kept so a future export pipeline calls what the editor previews. */
export function renderWebsite(project: Project, options: { preview?: boolean } = {}) {
  return <WebsiteRenderer project={project} preview={options.preview} />;
}
