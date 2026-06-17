/* Stamp del manifest di versione per il dist (eseguito DOPO postcss da `npm run build`).
 *
 * SemVer auto-derivata dai prefissi conventional-commit del subject di HEAD
 * (nessuna dipendenza esterna):
 *   - nessun tag v* ancora     → primo release = la versione di package.json (es. 0.1.0)
 *   - pre-1.0 (major == 0)     → breaking bumpa la MINOR (resta in 0.x), tutto il resto la PATCH
 *   - post-1.0                 → semver classico: breaking→MAJOR, feat→MINOR, resto→PATCH
 *
 * Modalità:
 *   - locale (`npm run build`)            → version = "<pkg.version>-dev" (NON bumpa, NON tagga)
 *   - release (env WC26_RELEASE=1, in CI) → version = la semver calcolata (il workflow la tagga)
 *
 * Output: dist/asset-manifest.json = { version, pr, sha, css, builtAt }.
 * `pr`/`sha` sono per tracciabilità; `version` è il `ver` per wp_enqueue_style.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const sh = (cmd, fallback = '') => {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return fallback; }
};

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const release = process.env.WC26_RELEASE === '1';

const subject = sh('git log -1 --pretty=%s');
const bodyMsg = sh('git log -1 --pretty=%b');
const breaking = /!:/.test(subject) || /BREAKING CHANGE/.test(`${subject}\n${bodyMsg}`);
const isFeat = /^feat(\(.*\))?!?:/.test(subject);

const tags = sh('git tag -l "v*" --sort=-v:refname').split('\n').filter(Boolean);

let version;
if (tags.length === 0) {
  version = pkg.version;                          // primo release = versione di package.json
} else {
  let [maj, min, pat] = tags[0].replace(/^v/, '').split('.').map(Number);
  if (maj === 0) {                                // pre-1.0: resta in 0.x
    if (breaking) { min++; pat = 0; } else { pat++; }
  } else {                                        // post-1.0: semver classico
    if (breaking) { maj++; min = 0; pat = 0; }
    else if (isFeat) { min++; pat = 0; }
    else { pat++; }
  }
  version = `${maj}.${min}.${pat}`;
}

const manifest = {
  version: release ? version : `${pkg.version}-dev`,
  pr: (subject.match(/\(#(\d+)\)/) || [])[1] || null,
  sha: sh('git rev-parse --short HEAD'),
  css: existsSync('dist/main.min.css')
    ? createHash('md5').update(readFileSync('dist/main.min.css')).digest('hex').slice(0, 8)
    : null,
  builtAt: new Date().toISOString(),
};

writeFileSync('dist/asset-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `[stamp] ${release ? 'RELEASE' : 'dev'} version=${manifest.version} ` +
  `pr=${manifest.pr ?? '—'} sha=${manifest.sha} css=${manifest.css}`
);
