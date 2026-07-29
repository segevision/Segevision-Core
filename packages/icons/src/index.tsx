import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon size in px — mirrors Design System v1 icon-size tokens (16/20/24/32). */
  size?: 16 | 20 | 24 | 32;
}

/**
 * Shared base: fixed stroke-width (1.5px per Design System v1, Part 2), consistent
 * viewBox, and `aria-hidden` by default since icons are always paired with a visible
 * or `aria-label`-carrying text sibling per the Accessibility principle (Part 1/6).
 */
function createIcon(path: React.ReactNode, displayName: string) {
  const IconComponent = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = 1.5, ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {path}
      </svg>
    ),
  );
  IconComponent.displayName = displayName;
  return IconComponent;
}

/**
 * Brand glyphs (WhatsApp, Instagram, Facebook) only read correctly as solid shapes —
 * a 1.5px stroke version of a third-party logo is no longer that logo. They therefore
 * opt out of the shared stroke treatment but keep the same sizing/a11y contract.
 */
function createFilledIcon(path: React.ReactNode, displayName: string) {
  const IconComponent = React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {path}
    </svg>
  ));
  IconComponent.displayName = displayName;
  return IconComponent;
}

export const PhoneIcon = createIcon(
  <path d="M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .97.76l1.1 4.4a1 1 0 0 1-.27.95L7.6 10.6a12 12 0 0 0 5.8 5.8l1.5-1.48a1 1 0 0 1 .95-.27l4.4 1.1a1 1 0 0 1 .76.97V19a2 2 0 0 1-2 2h-1C9.16 21 3 14.84 3 7V5Z" />,
  'PhoneIcon',
);

export const WhatsAppIcon = createFilledIcon(
  <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.38a9.87 9.87 0 0 0 4.69 1.19h.004c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.03 8.03 0 0 1 2.37 5.72c0 4.46-3.63 8.09-8.1 8.09a8.1 8.1 0 0 1-4.12-1.13l-.29-.17-3.06.8.82-2.98-.19-.31a8.02 8.02 0 0 1-1.24-4.3c0-4.46 3.63-8.09 8.09-8.09Zm-3.4 3.9c-.16 0-.42.06-.65.3-.22.25-.85.84-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.62 4.16 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.47-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.25-.63.79-.77.95-.14.17-.28.19-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.68-.14-.25-.02-.38.11-.5.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.47-.4-.41-.55-.42h-.47Z" />,
  'WhatsAppIcon',
);

export const InstagramIcon = createFilledIcon(
  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 2.16c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.64 3.64 0 0 0-.88-1.35 3.64 3.64 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.67a5.01 5.01 0 1 1 0 10.02 5.01 5.01 0 0 1 0-10.02Zm0 8.26a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm6.38-8.46a1.17 1.17 0 1 1-2.34 0 1.17 1.17 0 0 1 2.34 0Z" />,
  'InstagramIcon',
);

export const FacebookIcon = createFilledIcon(
  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />,
  'FacebookIcon',
);

export const ChevronDownIcon = createIcon(<path d="m6 9 6 6 6-6" />, 'ChevronDownIcon');

/** Direction-aware — flips automatically inside an RTL context via the `.rtl-flip` class. */
export const ArrowIcon = createIcon(<path d="M5 12h14m-6-6 6 6-6 6" />, 'ArrowIcon');

export const CheckIcon = createIcon(<path d="m5 13 4 4L19 7" />, 'CheckIcon');

export const CloseIcon = createIcon(<path d="m6 6 12 12M18 6 6 18" />, 'CloseIcon');

export const MenuIcon = createIcon(
  <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>,
  'MenuIcon',
);

export const StarIcon = createIcon(
  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />,
  'StarIcon',
);

export const MapPinIcon = createIcon(
  <>
    <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </>,
  'MapPinIcon',
);

export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
  'CalendarIcon',
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
  'ClockIcon',
);

export const MailIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </>,
  'MailIcon',
);

export const ShieldCheckIcon = createIcon(
  <>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
  'ShieldCheckIcon',
);

export const ActivityIcon = createIcon(
  <path d="M3 12h3.5L9 5l4 14 2.5-7H21" />,
  'ActivityIcon',
);

export const BookOpenIcon = createIcon(
  <>
    <path d="M12 6.5C10.5 5.2 8.4 4.5 6 4.5H3v13h3c2.4 0 4.5.7 6 2 1.5-1.3 3.6-2 6-2h3v-13h-3c-2.4 0-4.5.7-6 2Z" />
    <path d="M12 6.5v13" />
  </>,
  'BookOpenIcon',
);

export const AwardIcon = createIcon(
  <>
    <circle cx="12" cy="9" r="5.5" />
    <path d="m8.5 13.5-1.3 7 4.8-2.6 4.8 2.6-1.3-7" />
  </>,
  'AwardIcon',
);

export const UsersIcon = createIcon(
  <>
    <path d="M15.5 20v-1.6a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.4V20" />
    <circle cx="9.25" cy="8" r="3.5" />
    <path d="M21 20v-1.6a3.6 3.6 0 0 0-2.7-3.48M16 4.7a3.5 3.5 0 0 1 0 6.6" />
  </>,
  'UsersIcon',
);

export const SparkIcon = createIcon(
  <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />,
  'SparkIcon',
);

export const PlayIcon = createIcon(<path d="M8 5.5v13l10-6.5-10-6.5Z" />, 'PlayIcon');

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />, 'PlusIcon');

export const MinusIcon = createIcon(<path d="M5 12h14" />, 'MinusIcon');

export const TargetIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.75" fill="currentColor" />
  </>,
  'TargetIcon',
);

export const StethoscopeIcon = createIcon(
  <>
    <path d="M5 3v5a4 4 0 0 0 8 0V3" />
    <path d="M5 3H3.5M13 3h1.5M9 12v2.5a5 5 0 0 0 10 0V13" />
    <circle cx="19" cy="11" r="2" />
  </>,
  'StethoscopeIcon',
);

export const DumbbellIcon = createIcon(
  <>
    <path d="M3 9v6M6.5 7v10M17.5 7v10M21 9v6M6.5 12h11" />
  </>,
  'DumbbellIcon',
);

export const ImageIcon = createIcon(
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.75" />
    <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" />
  </>,
  'ImageIcon',
);

export const AlertIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.2v.3" />
  </>,
  'AlertIcon',
);
