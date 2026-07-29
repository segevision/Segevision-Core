import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildTokensCss } from '../src/build-css';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../css');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'tokens.css'), buildTokensCss(), 'utf-8');
// eslint-disable-next-line no-console
console.log('[@segevision/tokens] generated css/tokens.css');
