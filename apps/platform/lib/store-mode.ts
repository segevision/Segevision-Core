/**
 * Which storage backend a request should use — pure configuration logic.
 *
 * Deliberately in its own module with no Next or Supabase imports, so the rule that decides
 * where client data goes can be read, reasoned about and exercised on its own. It is the
 * single most consequential branch in the app: get it wrong in one direction and staging
 * silently writes to a disk that evaporates; get it wrong in the other and local
 * development stops working.
 *
 * The rule is never a fallback. A production deployment whose Supabase connection is broken
 * must fail loudly, because writing to a serverless filesystem instead would accept every
 * save, report success, and lose the work at the next cold start. A visible error costs an
 * afternoon; silent data loss costs a client.
 */

export type StoreMode = 'file' | 'supabase';

export class StoreConfigurationError extends Error {}

export interface StoreModeEnvironment {
  PROJECT_STORE?: string;
  NODE_ENV?: string;
  SEGEVISION_DATA_ROOT?: string;
}

/**
 * PROJECT_STORE is required in production. In development it defaults to `file`, so a fresh
 * clone with no Supabase project still runs.
 *
 * `file` in production is refused unless SEGEVISION_DATA_ROOT is set, because that is the
 * only situation in which a persistent disk plausibly exists — a container with a mounted
 * volume. On Vercel it is never true.
 */
export function resolveStoreModeFrom(env: StoreModeEnvironment): StoreMode {
  const raw = env.PROJECT_STORE?.trim().toLowerCase();
  const isProduction = env.NODE_ENV === 'production';

  if (!raw) {
    if (isProduction) {
      throw new StoreConfigurationError(
        'PROJECT_STORE is not set. Production requires PROJECT_STORE=supabase; ' +
          'defaulting to the local filesystem would lose every save on a serverless host.',
      );
    }
    return 'file';
  }

  if (raw !== 'file' && raw !== 'supabase') {
    throw new StoreConfigurationError(
      `PROJECT_STORE="${raw}" is not a known mode. Use "supabase" or "file".`,
    );
  }

  if (raw === 'file' && isProduction && !env.SEGEVISION_DATA_ROOT) {
    throw new StoreConfigurationError(
      'PROJECT_STORE=file is refused in production without SEGEVISION_DATA_ROOT. ' +
        'A serverless filesystem is ephemeral, so saves would be silently discarded. ' +
        'Set PROJECT_STORE=supabase, or set SEGEVISION_DATA_ROOT to a real mounted volume.',
    );
  }

  return raw;
}

export function resolveStoreMode(): StoreMode {
  return resolveStoreModeFrom({
    // Read as literal member access so Next's build-time substitution applies.
    PROJECT_STORE: process.env.PROJECT_STORE,
    NODE_ENV: process.env.NODE_ENV,
    SEGEVISION_DATA_ROOT: process.env.SEGEVISION_DATA_ROOT,
  });
}
