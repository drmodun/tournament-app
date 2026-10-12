-- Runs once, when the database volume is first created.
-- The default database (tournament) is created by the image; add the test database beside it.
CREATE DATABASE tournament_test;

\connect tournament
CREATE EXTENSION IF NOT EXISTS postgis;

\connect tournament_test
CREATE EXTENSION IF NOT EXISTS postgis;
