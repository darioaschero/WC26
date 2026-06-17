# Integrazione WC26 → tema GC (WordPress)

Sezione speciale World Cup, sviluppata in questo repo. Il tema GC **consuma un artefatto buildato**, non il sorgente. Sorgente = CSS vanilla; il bundle/minify è solo una pipeline di build (`npm run build`, PostCSS).

## Cosa viene pubblicato
La Action `publish-dist` (post-merge su `main`) builda e pubblica sul branch **`release`** + tag **`vX.Y.Z`**:
- `dist/main.min.css` (+ `.map`) — CSS bundlato e minificato dell'intera sezione (gli 8 `@import` in un file).
- `dist/asset-manifest.json` — `{ version, pr, sha, css }`.
- `fonts/` — i `.woff2` referenziati via `url(../fonts/…)`.

## Come pescarlo
Pinnare un **tag** (immutabile), via subtree (o submodule):
```sh
git subtree pull --prefix themes/gc/sections/wc26 <repo-url> v0.3.0 --squash
```

## Enqueue (tema)
```php
$base = '/sections/wc26';
$m    = json_decode(@file_get_contents(get_template_directory() . $base . '/dist/asset-manifest.json'), true);
wp_enqueue_style('wc26', get_template_directory_uri() . $base . '/dist/main.min.css', [], $m['version'] ?? null);
```
`?ver` = la semver del manifest → cache-bust per release.

## Font
`dist/` e `fonts/` vanno tenuti **fratelli** (come nel branch `release`): il CSS usa `url(../fonts/…)`. Se li spostate, riscrivete quei path.

## Versionamento (SemVer dai prefissi di commit)
| bump | da | significato per voi |
|---|---|---|
| **PATCH** | `fix:` / altro | tweak CSS, **markup invariato** → pull quando volete |
| **MINOR** | `feat:` | nuovi componenti, **markup retro-compatibile** |
| **MAJOR** | `feat!:` / `BREAKING CHANGE` | **contratto di markup cambiato** → aggiornate i template PHP |

Pre-`1.0.0` = sezione ancora in evoluzione (in 0.x il breaking bumpa la MINOR, resta in 0.x). **`1.0.0` = go-live**, contratto congelato.

## Contratto di markup — caveat
- Il wrapper è `<div class="page">` e il selettore CSS è **`div.page`**, non `.page`: in WP il `<body>` porta la classe `page` da `body_class()`, e `.page` nudo aggancerebbe anche il body → doppio padding (container sul body + `.page > *` impilato). **Mantenete `<div class="page">`** nel template.
- I `@layer` (ordine `reset, tokens, base, type, layout, modules, utilities`) sono dichiarati in testa al bundle: non riordinarli.
- `<main id="content">` è condiviso con `body_class()` ma è lo stesso elemento, nessun conflitto.
