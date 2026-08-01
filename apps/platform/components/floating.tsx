'use client';

import * as React from 'react';
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
  safePolygon,
  type Placement,
} from '@floating-ui/react';
import { cn } from '@segevision/utils';

/**
 * The platform's floating layer.
 *
 * Every dropdown, menu and tooltip in the studio goes through this file. Before it, each
 * one was an `absolute` div inside whatever happened to contain it, which failed in three
 * ways at once:
 *
 *   * it was clipped by any ancestor with `overflow-hidden` — the project card clipped its
 *     own action menu, so the menu was invisible on every card, not just the bottom row;
 *   * it never measured available space, so it opened downward off the bottom of the
 *     viewport;
 *   * `position: fixed` could not have rescued it either, because a transformed ancestor
 *     (the card's hover lift) becomes the containing block for fixed descendants.
 *
 * The fix has to be all three at once: render through a portal, position with real
 * collision detection, and keep re-measuring while open. That is what Floating UI provides
 * and why it is a dependency rather than something hand-rolled.
 *
 * One rule follows from this: **a scroll container must never be a popover's positioning
 * parent.** Nothing in here relies on an ancestor for containment.
 */

/**
 * One z-index scale for the whole studio, so layering is a decision rather than an
 * accident of who last needed to be on top.
 */
export const LAYER = {
  /** Sticky headers and rails. */
  chrome: 30,
  /** Menus, dropdowns and pickers. */
  popover: 60,
  /** Modal dialogs and their backdrops. */
  dialog: 70,
  /** Tooltips — above menus, because a menu item can own one. */
  tooltip: 80,
  /** Toasts. Always last. */
  toast: 90,
} as const;

/** Distance kept from every viewport edge, so nothing sits flush against the screen. */
const VIEWPORT_PADDING = 12;

/**
 * Focus management for the modal dialogs, which are plain `fixed inset-0` overlays rather
 * than floating elements and so cannot use FloatingFocusManager.
 *
 * Three things, none of which the dialogs did before: move focus into the dialog when it
 * opens, keep Tab inside it while it is open, and put focus back where it came from when it
 * closes. Without the last one a keyboard user who opens the readiness checklist and closes
 * it is silently returned to the top of the document.
 */
export function useDialogFocus(open: boolean, ref: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    if (!node) return;

    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Focus the dialog itself rather than its first control: landing on "delete" because
    // it happens to be first is how people delete things they did not mean to.
    node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, ref]);
}

export interface MenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  hint?: string;
  disabled?: boolean;
}

/**
 * A collision-aware dropdown menu.
 *
 * Behaviour that the old implementation lacked and that is now guaranteed:
 * opens downward when there is room and flips up when there is not; shifts along the
 * cross axis rather than leaving the viewport; keeps a gap from every edge; re-measures on
 * scroll and resize via `autoUpdate`; caps its own height and scrolls internally when the
 * viewport is short; restores focus to the trigger on close; and supports full keyboard
 * navigation including typeahead.
 *
 * RTL needs no special handling here — Floating UI reads the computed direction, so
 * `placement: 'bottom-end'` resolves to the correct physical side on its own.
 */
export function DropdownMenu({
  trigger,
  items,
  label,
  placement = 'bottom-end',
  className,
}: {
  /** Rendered as the trigger. Receives the props Floating UI needs. */
  trigger: (props: {
    ref: (node: HTMLElement | null) => void;
    open: boolean;
    props: Record<string, unknown>;
  }) => React.ReactNode;
  items: MenuItem[];
  label: string;
  placement?: Placement;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);
  const labelsRef = React.useRef<Array<string | null>>(items.map((item) => item.label));

  labelsRef.current = items.map((item) => item.label);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    // `flip` before `shift`: try the opposite side first, and only slide along the edge if
    // neither side fits. Sliding a menu that could simply have opened upward looks broken.
    middleware: [
      offset(6),
      flip({ padding: VIEWPORT_PADDING, fallbackAxisSideDirection: 'end' }),
      shift({ padding: VIEWPORT_PADDING }),
      size({
        padding: VIEWPORT_PADDING,
        apply({ availableHeight, elements }) {
          // A short viewport gets a scrollable menu rather than a clipped one.
          elements.floating.style.maxHeight = `${Math.max(120, availableHeight)}px`;
        },
      }),
    ],
    /*
     * Position with `top`/`left` rather than a transform.
     *
     * `.studio-pop` — the studio's entrance motion — animates `transform`, and a running
     * animation beats an inline style in the cascade. With the default transform strategy
     * the animation's final `transform: none` wiped out Floating UI's positioning offset
     * the instant the menu appeared, dropping it at the portal's origin instead of beside
     * its trigger. Keeping position off the transform channel lets both coexist.
     */
    transform: false,
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context, { role: 'menu' });
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    focusItemOnOpen: 'auto',
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: setActiveIndex,
    enabled: open,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  return (
    <>
      {trigger({ ref: refs.setReference, open, props: getReferenceProps() })}

      {open && (
        <FloatingPortal>
          {/* returnFocus restores the trigger after Escape or a selection, which the old
              menu never did — keyboard users were dropped at the top of the document. */}
          <FloatingFocusManager context={context} modal={false} returnFocus>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: LAYER.popover }}
              aria-label={label}
              className={cn(
                'studio-pop studio-scroll min-w-[11rem] overflow-y-auto rounded-xl bg-studio-panel p-1 shadow-studio-lg ring-1 ring-studio-line',
                className,
              )}
              {...getFloatingProps()}
            >
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  ref={(node) => {
                    listRef.current[index] = node;
                  }}
                  tabIndex={activeIndex === index ? 0 : -1}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-start text-ui-sm font-medium',
                    'transition-colors duration-[var(--t-state)] disabled:cursor-not-allowed disabled:opacity-50',
                    item.tone === 'danger'
                      ? 'text-studio-danger hover:bg-studio-danger/10 focus-visible:bg-studio-danger/10'
                      : 'text-studio-soft hover:bg-studio-raised hover:text-studio-ink focus-visible:bg-studio-raised focus-visible:text-studio-ink',
                    // Keyboard focus must look identical to hover, or arrow-key users
                    // cannot see where they are.
                    activeIndex === index &&
                      (item.tone === 'danger'
                        ? 'bg-studio-danger/10'
                        : 'bg-studio-raised text-studio-ink'),
                  )}
                  {...getItemProps({
                    onClick() {
                      if (item.disabled) return;
                      setOpen(false);
                      item.onSelect();
                    },
                  })}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.hint ? (
                    <span
                      dir="ltr"
                      className="shrink-0 font-studio-mono text-ui-label text-studio-faint"
                    >
                      {item.hint}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

/**
 * A generic collision-aware popover, for content that is not a menu.
 *
 * Used by the add-section picker, which is a grid of cards rather than a list of commands
 * and therefore should not claim `role="menu"`.
 */
export function Popover({
  trigger,
  children,
  label,
  placement = 'bottom-start',
  className,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger: (props: {
    ref: (node: HTMLElement | null) => void;
    open: boolean;
    props: Record<string, unknown>;
  }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  label: string;
  placement?: Placement;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(6),
      flip({ padding: VIEWPORT_PADDING }),
      shift({ padding: VIEWPORT_PADDING }),
      size({
        padding: VIEWPORT_PADDING,
        apply({ availableHeight, availableWidth, elements }) {
          elements.floating.style.maxHeight = `${Math.max(160, availableHeight)}px`;
          // Narrow phones must not get a popover wider than the screen.
          elements.floating.style.maxWidth = `${Math.max(220, availableWidth)}px`;
        },
      }),
    ],
    /*
     * Position with `top`/`left` rather than a transform.
     *
     * `.studio-pop` — the studio's entrance motion — animates `transform`, and a running
     * animation beats an inline style in the cascade. With the default transform strategy
     * the animation's final `transform: none` wiped out Floating UI's positioning offset
     * the instant the menu appeared, dropping it at the portal's origin instead of beside
     * its trigger. Keeping position off the transform channel lets both coexist.
     */
    transform: false,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, { outsidePressEvent: 'mousedown' }),
    useRole(context, { role: 'dialog' }),
  ]);

  return (
    <>
      {trigger({ ref: refs.setReference, open, props: getReferenceProps() })}

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} returnFocus>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: LAYER.popover }}
              aria-label={label}
              className={cn(
                'studio-pop studio-scroll overflow-y-auto rounded-xl bg-studio-panel shadow-studio-lg ring-1 ring-studio-line',
                className,
              )}
              {...getFloatingProps()}
            >
              {children(() => setOpen(false))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

/**
 * Tooltip with collision handling.
 *
 * The previous implementation centred itself with `start-1/2 translate-x-1/2` plus an RTL
 * override that pushed it the wrong way — in an RTL document the tooltip sat a half-width
 * off its trigger. Floating UI centres against the real trigger box, so there is no
 * direction-dependent arithmetic left to get wrong.
 *
 * `safePolygon` keeps the tooltip open while the pointer travels toward it, which matters
 * for the icon buttons in the card action row where the gap is small.
 */
export function Tooltip({
  label,
  shortcut,
  children,
  placement = 'bottom',
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
  placement?: Placement;
}) {
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(6),
      flip({ padding: VIEWPORT_PADDING }),
      shift({ padding: VIEWPORT_PADDING }),
    ],
    /*
     * Position with `top`/`left` rather than a transform.
     *
     * `.studio-pop` — the studio's entrance motion — animates `transform`, and a running
     * animation beats an inline style in the cascade. With the default transform strategy
     * the animation's final `transform: none` wiped out Floating UI's positioning offset
     * the instant the menu appeared, dropping it at the portal's origin instead of beside
     * its trigger. Keeping position off the transform channel lets both coexist.
     */
    transform: false,
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false, delay: { open: 150, close: 0 }, handleClose: safePolygon() }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ]);

  return (
    <span className="inline-flex" ref={refs.setReference} {...getReferenceProps()}>
      {children}
      {open && (
        <FloatingPortal>
          <span
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: LAYER.tooltip }}
            className="studio-pop pointer-events-none max-w-[min(15rem,60vw)] rounded-md bg-studio-ink px-2 py-1 text-ui-xs font-medium text-studio-panel shadow-studio-md"
            {...getFloatingProps()}
          >
            {label}
            {shortcut ? (
              <span className="ms-2 font-studio-mono opacity-60" dir="ltr">
                {shortcut}
              </span>
            ) : null}
          </span>
        </FloatingPortal>
      )}
    </span>
  );
}
