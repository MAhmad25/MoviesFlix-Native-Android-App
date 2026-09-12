# Fonts

`_layout.tsx` loads two custom fonts via `expo-font`'s `useFonts()`. It expects
these exact filenames in this folder:

- `primary.ttf`   (from primary.woff2)   → registered as font family "Primary"
- `astralaga.ttf` (from astralaga.woff2) → registered as font family "Astralaga"

.woff2 is a web-only format — expo-font needs .ttf/.otf to work on iOS/Android,
so the originals here need converting once (e.g. via an online woff2-to-ttf
tool, or `fonttools`: `fonttools ttLib.woff2 decompress astralaga.woff2 -o astralaga.ttf`).

Usage in components: import `{ fonts }` from `@/constants/fonts` and apply
`style={{ fontFamily: fonts.heading }}` (titles/headers) or
`style={{ fontFamily: fonts.body }}` (paragraphs/labels).
