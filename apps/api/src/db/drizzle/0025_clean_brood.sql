ALTER TABLE "location" ALTER COLUMN "coordinates" SET DATA TYPE geography(POINT, 4326);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_index" ON "location" USING gist ("coordinates");