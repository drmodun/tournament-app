import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Content links are written as /docs/<page>/, the address behind the proxy.
// Where the site is mounted elsewhere (Vercel / Netlify serve it from the
// root), this swaps that prefix for the build's base after rendering, so the
// links still resolve. Runs before Starlight's own post-build steps.
export function docsBaseLinks({ base }) {
	const prefix = base === "/" ? "" : base;
	const links = /(href=["'])\/docs(?=[/#?"'])/g;

	async function* htmlFiles(dir) {
		for (const entry of await readdir(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) yield* htmlFiles(path);
			else if (entry.name.endsWith(".html")) yield path;
		}
	}

	return {
		name: "docs-base-links",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				if (prefix === "/docs") return;
				for await (const file of htmlFiles(fileURLToPath(dir))) {
					const html = await readFile(file, "utf8");
					const next = html.replace(links, (_, attr) => `${attr}${prefix}`);
					if (next !== html) await writeFile(file, next);
				}
			},
		},
	};
}
