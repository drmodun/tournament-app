# Tournament App

A comprehensive tournament management application built with NestJS (API) and Next.js (Web frontend).

## Project Structure

This is a monorepo project with the following structure:

- `apps/api`: NestJS backend API
- `apps/web`: Next.js frontend application
- `packages`: Shared packages and types
- `docs`: Documentation (currently dormant, will be used later as a standalone docs site)
- `admin`: Admin panel (not currently used, will be used later for superadmins only, now they just act as all privileges enabled users)

## Prerequisites

- Node.js (v16+)
- Yarn package manager
- PostgreSQL database
- Environment variables (see below)

## Environment Variables

**IMPORTANT:** This project requires specific environment variables to run properly. Without these environment files, it will be impossible to run the application.

You'll need to create the following files based on the examples provided in the project:
- `.env.local` in the root directory
- `.env.local` in the `apps/web` directory - for the gmaps keys

The required variables include database connection strings, JWT secrets, and third-party API keys (Challonge, Firebase, Google, etc.).

The approximate structure of the env files is present in the `env.` files.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
```

**Note:** If you encounter issues with the hawk dependency, use:

```bash
yarn install --ignore-engines
```

## Database Setup

1. Create a PostgreSQL database for the application
2. Make sure you have the postgis extension installed, you can do this by running `CREATE EXTENSION postgis;` in the database or if you do not have the package, you can install it by running `apt install postgresql-15-postgis-3` (for ubuntu, assuming version 15, adjust accordingly to the version and the OS)
3. Navigate to the API directory:

```bash
cd apps/api
```

3. Run migrations to set up the database schema:

```bash
yarn migrate
```

4. Seed the database with initial data:

```bash
yarn seed
```

## Building and Running the Application

1. From the root directory, build all packages and applications:

```bash
yarn build
```

2. Start the development servers:

```bash
yarn dev
```

This will start both the API server and the web application.

- API: http://localhost:5000 (or the port specified in your environment variables)
- Web: http://localhost:3000

## Testing

Please note that all the tests require a special .env.test.local file to run properly and for it to be filled with the same structure as the .env.local file (and be set to the test mode).

For unit tests (the api project):

```bash
yarn test
```

For end-to-end tests:

```bash
yarn test:e2e
```

## Features

- Tournament creation and management
- Group/team management
- User registration and authentication
- LFP and LFG search 
- Bracket generation and visualization (single elim only as of right now)
- Location-based services (using Google Maps API)
- Email notifications
- Many more tournament features are coming

## Troubleshooting

- If you encounter issues with dependencies, particularly the hawk dependency, use `yarn install --ignore-engines`
- Make sure your PostgreSQL database is running before attempting to run migrations or start the API
- Check that all environment variables are properly set according to the examples
- Docker will be implemented later to containerize the application and ease the setup process (although the environment variables would still be required)

## License

[MIT](LICENSE)
