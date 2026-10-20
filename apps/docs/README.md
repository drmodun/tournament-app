# docs

Documentation site for the tournament app, built with [Astro Starlight](https://starlight.astro.build).

```bash
yarn turbo dev --filter=docs     # http://localhost:4321/docs/
yarn turbo build --filter=docs   # astro check + static build into dist/
```

Pages are Markdown/MDX files in `src/content/docs/`; the sidebar is defined in `astro.config.mjs`. The site is built
with the base path `/docs`, so every internal link starts with `/docs/`.

In Docker the image serves `dist/` with Caddy on port 4321, and the main proxy forwards `/docs/*` to it, so the docs
are at http://localhost/docs/.
