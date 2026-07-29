'use client';

import type { SectionPreset } from '@segevision/renderer';

/**
 * Saved section presets.
 *
 * Presets are stored at the *platform* level, not inside a project, because their
 * whole value is reuse across clients. Each one is a snapshot: inserting a preset
 * builds a fresh section instance with regenerated content ids, so the inserted
 * section and the saved preset can never write into each other.
 */

export interface PresetStore {
  list(): SectionPreset[];
  save(preset: SectionPreset): void;
  remove(id: string): void;
}

const STORAGE_KEY = 'segevision-section-presets';

function read(): SectionPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SectionPreset[]) : [];
  } catch {
    return [];
  }
}

function write(presets: SectionPreset[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Storage unavailable — presets simply do not persist this session.
  }
}

class LocalPresetStore implements PresetStore {
  list(): SectionPreset[] {
    return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  save(preset: SectionPreset): void {
    write([preset, ...read().filter((item) => item.id !== preset.id)]);
  }

  remove(id: string): void {
    write(read().filter((item) => item.id !== id));
  }
}

export const presetStore: PresetStore = new LocalPresetStore();
