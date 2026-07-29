'use client';

import { createContext } from 'react';

export type Direction = 'rtl' | 'ltr';

export interface DirectionContextValue {
  direction: Direction;
  setDirection: (direction: Direction) => void;
}

/**
 * Shared context so @segevision/ui's RTLProvider and @segevision/hooks'
 * useDirection stay decoupled — hooks never import ui, ui never needs to
 * duplicate this type.
 */
export const DirectionContext = createContext<DirectionContextValue>({
  direction: 'rtl',
  setDirection: () => {},
});
