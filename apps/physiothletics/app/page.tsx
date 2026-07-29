'use client';

import {
  CalendarIcon,
  PhoneIcon,
  WhatsAppIcon,
  FacebookIcon,
  InstagramIcon,
} from '@segevision/icons';
import {
  AppointmentForm,
  AuthorityFeature,
  Button,
  ContactSection,
  FAQSection,
  FeatureGrid,
  HeroSection,
  ImagePlaceholder,
  MobileContactBar,
  PlaceholderLog,
  ProblemNeedSelector,
  ProcessTimeline,
  ServiceGrid,
  SiteFooter,
  SiteHeader,
  TeamGrid,
  TrustStrip,
} from '@segevision/ui';

import { faqItems } from '../content/faq';
import { footerColumns, legalLinks, primaryNav, sectionIds } from '../content/navigation';
import {
  DEV_PHONE_DISPLAY,
  DEV_PHONE_HREF,
  DEV_WHATSAPP_HREF,
  placeholderEntries,
} from '../content/placeholders';
import { processSteps, services, whyPoints } from '../content/services';
import {
  appointmentCopy,
  appointmentDemoNotice,
  appointmentSection,
  approachSection,
  brand,
  contactChannels,
  contactSection,
  faqSection,
  footerContent,
  heroActionLabels,
  heroContent,
  heroCredentials,
  heroTitleLines,
  hoursTitle,
  mobileBarLabels,
  openingHours,
  openingHoursNote,
  painOptions,
  painSection,
  processSection,
  servicesSection,
  teamMembers,
  teamNote,
  teamSection,
  trustItems,
  whySection,
} from '../content/site-content';

/**
 * The page is a client component so that icon components can be passed straight
 * from the content files into the shared sections. Next still server-renders it —
 * the whole homepage is present in the initial HTML, which is what local SEO needs.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader
        overlay
        brand={{ name: brand.name, href: `#${sectionIds.hero}`, tagline: brand.tagline }}
        items={primaryNav}
        primaryAction={{ label: heroActionLabels.appointment, href: `#${sectionIds.appointment}` }}
        secondaryAction={{
          label: DEV_PHONE_DISPLAY,
          href: DEV_PHONE_HREF,
          icon: PhoneIcon,
          ariaLabel: `התקשרו לקליניקה בטלפון ${DEV_PHONE_DISPLAY}`,
        }}
      />

      <main id="main">
        <HeroSection
          id={sectionIds.hero}
          eyebrow={heroContent.eyebrow}
          titleLines={heroTitleLines}
          lead={heroContent.lead}
          actions={[
            { label: heroActionLabels.appointment, href: `#${sectionIds.appointment}` },
            {
              label: heroActionLabels.whatsapp,
              href: DEV_WHATSAPP_HREF,
              variant: 'secondary',
              icon: WhatsAppIcon,
            },
            {
              label: heroActionLabels.phone,
              href: DEV_PHONE_HREF,
              variant: 'ghost',
              icon: PhoneIcon,
              ariaLabel: `התקשרו לקליניקה בטלפון ${DEV_PHONE_DISPLAY}`,
            },
          ]}
          credentials={heroCredentials}
          media={
            <ImagePlaceholder
              label={heroContent.mediaLabel}
              note={heroContent.mediaNote}
              ratio="4 / 5"
              tone="ink"
              className="ring-text-inverse/15"
            />
          }
          mediaOverlay={
            /* Glass card overlapping the image: ties the credibility claim to the
               photograph instead of leaving it as another line of body copy. */
            <div className="m-4 rounded-md bg-surface/85 p-4 shadow-e3 ring-1 ring-text-inverse/10 backdrop-blur-xl">
              <p className="font-display text-base font-bold leading-snug text-text-primary">
                {heroContent.overlayTitle}
              </p>
              <p className="mt-1 font-body text-sm text-text-secondary">{heroContent.overlaySubtitle}</p>
            </div>
          }
        />

        <TrustStrip items={trustItems} overlap />

        <ProblemNeedSelector
          id={sectionIds.pain}
          eyebrow={painSection.eyebrow}
          title={painSection.title}
          lead={painSection.lead}
          options={painOptions}
          disclaimer={painSection.disclaimer}
        />

        <ServiceGrid
          id={sectionIds.services}
          eyebrow={servicesSection.eyebrow}
          title={servicesSection.title}
          lead={servicesSection.lead}
          items={services}
        />

        <ProcessTimeline
          id={sectionIds.process}
          eyebrow={processSection.eyebrow}
          title={processSection.title}
          lead={processSection.lead}
          steps={processSteps}
          footer={
            <Button asChild size="lg" className="w-full tablet:w-auto">
              <a href={`#${sectionIds.appointment}`}>{heroActionLabels.appointment}</a>
            </Button>
          }
        />

        <AuthorityFeature
          id={sectionIds.approach}
          eyebrow={approachSection.eyebrow}
          title={approachSection.title}
          paragraphs={approachSection.paragraphs}
          quote={approachSection.quote}
          points={approachSection.points}
          note={approachSection.note}
          mediaSide="start"
          media={
            <ImagePlaceholder
              label={approachSection.mediaLabel}
              note={approachSection.mediaNote}
              ratio="4 / 5"
              tone="brand"
            />
          }
        />

        <FeatureGrid
          eyebrow={whySection.eyebrow}
          title={whySection.title}
          lead={whySection.lead}
          items={whyPoints}
          columns={4}
        />

        <TeamGrid
          id={sectionIds.team}
          eyebrow={teamSection.eyebrow}
          title={teamSection.title}
          lead={teamSection.lead}
          members={teamMembers}
        />

        <FAQSection
          id={sectionIds.faq}
          eyebrow={faqSection.eyebrow}
          title={faqSection.title}
          lead={faqSection.lead}
          items={faqItems}
          defaultOpenId={faqItems[0]?.id}
          aside={
            <div className="flex flex-col gap-3">
              <Button asChild variant="secondary" className="w-full tablet:w-auto">
                <a href={DEV_WHATSAPP_HREF}>
                  <WhatsAppIcon size={20} aria-hidden="true" />
                  {heroActionLabels.whatsapp}
                </a>
              </Button>
              <p className="font-body text-xs leading-relaxed text-text-secondary">{teamNote}</p>
            </div>
          }
        />

        <ContactSection
          id={sectionIds.contact}
          eyebrow={contactSection.eyebrow}
          title={contactSection.title}
          lead={contactSection.lead}
          channels={contactChannels}
          hoursTitle={hoursTitle}
          hours={openingHours}
          hoursNote={openingHoursNote}
          map={
            <ImagePlaceholder
              label={contactSection.mapLabel}
              note={contactSection.mapNote}
              ratio="16 / 10"
              tone="brand"
              badge="מפה להטמעה לאחר אימות הכתובת"
              className="h-full"
            />
          }
        />

        <AppointmentForm
          id={sectionIds.appointment}
          eyebrow={appointmentSection.eyebrow}
          title={appointmentSection.title}
          lead={appointmentSection.lead}
          assurances={appointmentSection.assurances}
          copy={appointmentCopy}
          demoNotice={appointmentDemoNotice}
        />
      </main>

      <MobileContactBar
        actions={[
          { id: 'call', label: mobileBarLabels.call, href: DEV_PHONE_HREF, icon: PhoneIcon },
          { id: 'whatsapp', label: mobileBarLabels.whatsapp, href: DEV_WHATSAPP_HREF, icon: WhatsAppIcon },
          {
            id: 'appointment',
            label: mobileBarLabels.appointment,
            href: `#${sectionIds.appointment}`,
            icon: CalendarIcon,
            emphasis: true,
          },
        ]}
      />

      <SiteFooter
        brand={{ name: brand.name, description: footerContent.description }}
        columns={footerColumns}
        contact={{
          title: footerContent.contactTitle,
          lines: [
            { id: 'address', label: 'כתובת', value: brand.location, pendingLabel: 'כתובת מדויקת לאימות' },
            {
              id: 'phone',
              label: 'טלפון',
              value: DEV_PHONE_DISPLAY,
              href: DEV_PHONE_HREF,
              pendingLabel: 'ערך פיתוח — ממתין לאימות',
            },
            { id: 'hours', label: 'שעות פעילות', value: 'ראשון – חמישי, 08:00–19:00', pendingLabel: 'ממתין לאישור' },
          ],
        }}
        socials={[
          { id: 'facebook', label: 'פייסבוק', href: '#', icon: FacebookIcon },
          { id: 'instagram', label: 'אינסטגרם', href: '#', icon: InstagramIcon },
        ]}
        legalLinks={legalLinks}
        copyright={footerContent.copyright}
        credit={footerContent.credit}
      />

      {/* Review-build only: every unconfirmed detail, in one panel the client can walk through. */}
      <PlaceholderLog entries={placeholderEntries} />
    </>
  );
}
