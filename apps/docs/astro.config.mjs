import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { docsBaseLinks } from './docs-base-links.mjs';

// Where the docs are mounted depends on where they run:
//   - behind the Caddy proxy or the docs container (local, docker dev, docker prod): /docs
//   - Vercel / Netlify: the site root, detected from the platform's own build
//     variables, so nothing has to be configured there ("set and forget")
// DOCS_BASE overrides either way. Use "/" for the root: an empty value is
// dropped by some dashboards, which would silently fall back to /docs and
// request every stylesheet and image from a path that does not exist.
const hostedAtRoot = Boolean(process.env.VERCEL || process.env.NETLIFY);
const normalizeBase = (value) => {
	const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
	return trimmed ? `/${trimmed}` : '/';
};
const base = normalizeBase(process.env.DOCS_BASE || (hostedAtRoot ? '/' : '/docs'));

// Absolute links (sitemap, canonical) need the public address: the host's own
// deployment URL when there is one.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const site = process.env.PUBLIC_URL || process.env.URL || (vercelHost ? `https://${vercelHost}` : undefined);

export default defineConfig({
	site,
	base,
	trailingSlash: 'always',
	integrations: [
		docsBaseLinks({ base }),
		starlight({
			title: 'winning.sh docs',
			description: 'How the tournament app works: running it, its architecture, and the rules behind each feature.',
			logo: { src: './public/favicon.svg', alt: '' },
			favicon: '/favicon.svg',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/drmodun/tournament-app',
				},
			],
			lastUpdated: false,
			sidebar: [
				{
					label: 'Getting started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Quick start with Docker', slug: 'getting-started/docker' },
						{ label: 'Local development', slug: 'getting-started/local-development' },
						{ label: 'Configuration', slug: 'getting-started/configuration' },
					],
				},
				{
					label: 'Architecture',
					items: [
						{ label: 'Overview', slug: 'architecture/overview' },
						{ label: 'API (NestJS)', slug: 'architecture/api' },
						{ label: 'Web app (Next.js)', slug: 'architecture/web' },
						{ label: 'Database and domain model', slug: 'architecture/database' },
						{ label: 'Shared types package', slug: 'architecture/types' },
					],
				},
				{
					label: 'Features',
					items: [
						{ label: 'Accounts and authentication', slug: 'features/accounts' },
						{ label: 'API tokens', slug: 'features/api-tokens' },
						{ label: 'Groups', slug: 'features/groups' },
						{ label: 'Tournaments and stages', slug: 'features/tournaments' },
						{ label: 'Participation and rosters', slug: 'features/participation' },
						{ label: 'Matches and brackets', slug: 'features/matches' },
						{ label: 'Quizzes', slug: 'features/quizzes' },
						{ label: 'LFG and LFP', slug: 'features/lfg-lfp' },
						{ label: 'Notifications', slug: 'features/notifications' },
						{ label: 'Careers and ELO', slug: 'features/careers' },
						{ label: 'Locations and maps', slug: 'features/locations' },
						{ label: 'Social, interests and categories', slug: 'features/social' },
					],
				},
				{
					label: 'Operations',
					items: [
						{ label: 'Docker stack and deployment', slug: 'operations/deployment' },
						{ label: 'Testing and CI', slug: 'operations/testing' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'API endpoints', slug: 'reference/endpoints' },
						{ label: 'Permissions', slug: 'reference/permissions' },
						{ label: 'Enums', slug: 'reference/enums' },
						{ label: 'Known limitations', slug: 'reference/known-limitations' },
					],
				},
			],
		}),
	],
});
