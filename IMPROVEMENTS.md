# Migliorie future

Note da una review di qualità del codice (occhi nuovi, 2026-06-17, su `7477b8f`).
Il grosso non è nel CSS — è di alto livello — ma ai **bordi** (HTML / integrazione / a11y)
e nel debito «placeholder» pre-1.0, già auto-segnalato nei commenti del codice.

## Già gestito (non riaprire)

- **C1 — link root-absolute** (`href="/"`, `/abonnement` in `index.html` / `team/colombie.html`)
  e coerenza del breadcrumb: **gestito dal team WordPress** (route reali del sito host,
  templating PHP). Intenzionale, non una svista.
- **M1 — toggle griglia `:has()`-dipendente**: **risolto**. `@supports not selector(:has(*))`
  in `css/modules.css` nasconde checkbox + label «Voir tout» dove `:has()` manca, così il
  controllo non resta inerte e il carosello regge come fallback. `.cards--grid` (roster) non
  usa `:has()`, quindi la griglia fissa funziona comunque.

## Da fare

### Major

- **M2 — `alt=""` su TUTTE le `<img>`, incluse le 25 foto giocatori** (`team/colombie.html:111`…).
  Per bandiere e placeholder `.preview__media` è corretto; per i **ritratti** è una scelta presa
  implicitamente. → Decidere esplicitamente: `alt=""` *con commento* (ridondante col nome nell'`<h3>`
  adiacente) oppure `alt` reale (es. `alt="Lionel Messi"`).
- **M3 — manca `width`/`height` su `.preview__media` (homepage)** (`index.html:80,204,213,222,231,240`)
  **e sul `.team-hero__flag`** (`team/colombie.html:55`) → CLS prima del caricamento del CSS. Le foto
  giocatori già li hanno. → Aggiungerli (coerenza + stabilità del loader).

### Minor / hygiene

- **m1 — dead code**: `--space-00` (`css/tokens.css:4`) mai referenziato; `.text-display-md`
  (`css/type.css:53`) e `.text-sans-xs` (`css/type.css:80`) definiti e usati **0** volte nelle pagine.
  → Rimuovere, o marcare `/* reserved */` se fanno parte della scala pubblica di proposito.
- **m2 — `<br>` hardcoded** in «Qui gagnera la`<br>`Coupe du monde» (`index.html:181`): litiga con
  `text-wrap: balance` del reset e fissa un'interruzione legata alla copy francese. → Togliere e
  lasciare fare a `balance` + `max-inline-size` (`css/modules.css:761`).
- **m3 — duplicazione lieve**: il ring `:focus-visible::after` dei link estesi (`css/modules.css:328`
  e `:527`) e il blocco underline-hover (`css/modules.css` ~516, `css/layout.css:163`) sono ~identici
  2×. → Estrarre un pattern condiviso quando le forme si sono stabilizzate.
- **m4 — `transition` non gated** da `prefers-reduced-motion` in `css/rich-text.css:72` (fade di colore
  120ms; impatto ~zero, ma è l'unica incoerenza nello story reduced-motion). → Foldare nel blocco
  `no-preference` o accettare (le transizioni di colore sono generalmente esentate).
- **m5 — `aria-current="page"` su `<li>` non-link** (`index.html:20`, `team/colombie.html:28`). Valido
  ma più convenzionale sull'elemento-link; opzionale.

### Nit

- **README** è uno stub di una riga → dargli un entry point reale (dev server `:8080` via
  `.claude/launch.json`, puntatore a `INTEGRATION.md`).
- **`--bp-*`** (`css/tokens.css:36`) sono solo documentazione (i custom property non funzionano in
  `@media`) → ora che PostCSS è in pipeline, migrabili a `@custom-media` (il blocco dichiarato è
  proprio quello).
- **Placeholder pre-1.0** da tarare prima del rilascio: colori `--bg`/`--fg`, `--measure`, vari gap
  «provv.»/«da tarare», e il magic crop `scale(1.51) translateX(6%)` di `.preview--crop`
  (`css/modules.css:563`).
- **`scripts/stamp-version.mjs`** parsa solo il subject di `HEAD` (`git log -1`): uno squash-merge il
  cui subject perde il prefisso `feat:`/`!` sbaglia il bump semver. Dipende dall'igiene del subject del
  merge commit.

## Punti di forza (per contesto)

Tipografia token-driven single-source (ramp da un solo `--body`, i componenti **ricompongono** il
token); `clamp` fluidi matematicamente corretti; `@layer` dichiarato una volta e disaccoppiato
dall'ordine di import; a11y di base solida (`.sr-only` reale, `:focus-visible` ovunque incluso il ring
rettangolare sui link estesi, `prefers-reduced-motion` sui `scroll-behavior`, gerarchia heading pulita,
badge numero con `sr-only`); CLS gestito sulle 25 foto roster; build PostCSS minimale e corretta
(`calc: false` motivato); Action `publish-dist` hardened (orphan tree, `concurrency`, `paths` filter,
`dist/` gitignored).

## Posizione sul CSS «cutting-edge»

Deliberata, non avventata: `overflow: clip` ha `@supports not` → `hidden`; `reading-flow` degrada al
source-order (che è già mobile-first/feature-first); drop-cap (`initial-letter`), frecce
`::scroll-button` e anchor-positioning sono enhancement documentati; container queries Baseline-2023.
L'unica lacuna era il toggle `:has()` (**M1**, ora chiuso). I floor di versione browser citati nei
commenti del codice sono **approssimativi** (presi dai commenti stessi, non ri-verificati su caniuse).
