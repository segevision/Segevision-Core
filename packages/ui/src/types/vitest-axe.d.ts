// vitest-axe@0.1.0 ships matcher types but doesn't augment vitest's `Assertion`
// interface itself. This ambient declaration wires `toHaveNoViolations()` into
// `expect(...)`'s type so accessibility assertions type-check across the ui package.
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
