'use client';

import { useContext } from 'react';
import { DirectionContext } from './direction-context';

/**
 * Reads the current text direction from the nearest RTLProvider (@segevision/ui).
 * Defaults to 'rtl' since Segevision's primary market is Hebrew — see Design
 * System v1, Part 6 ("designed RTL-first").
 */
export function useDirection() {
  return useContext(DirectionContext);
}
