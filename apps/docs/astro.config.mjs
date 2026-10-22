import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Served under /docs, both behind the Caddy proxy and from the docs container itself
export default defineConfig({
	base: process.env.DOCS_BASE ??'/docs',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'winning.sh docs',
			description: 'How the tournament app works: running it, its architecture, and the rules behind each feature.',
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
