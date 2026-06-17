/* Pipeline di SOLO build (non tocca il sorgente, che resta CSS vanilla).
   Ordine: import → autoprefixer → cssnano (minify per ultimo).
   - postcss-import : inlina gli 8 @import di css/main.css in un file unico
                      (in dev il sorgente usa @import nativo; qui si bundla).
   - autoprefixer   : prefissi guidati da .browserslistrc (build-only).
   - cssnano        : minify (preset default; @layer / custom-props safe).
                      `calc: false` → disabilita il sotto-plugin postcss-calc:
                      è datato e non capisce la divisione lunghezza/lunghezza
                      (es. `(100vw - 64rem) / 34.5rem`, il nostro idioma di
                      interpolazione fluida, CSS valido e moderno) → altrimenti
                      warna a ogni build e rischierebbe di toccare quei calc.
                      Costo ~nullo: i nostri calc usano var(), non riducibili.
   Sourcemap esterna (dist/main.min.css.map). */
module.exports = {
  map: { inline: false },
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
    require('cssnano')({ preset: ['default', { calc: false }] }),
  ],
};
