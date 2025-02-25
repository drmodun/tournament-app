ALTER TABLE "location"
ADD COLUMN "coordinates" geometry(point) NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spatial_index" ON "location" USING gist ("coordinates");
ALTER TABLE "location" DROP COLUMN IF EXISTS "lat";
--> statement-breakpoint
ALTER TABLE "location" DROP COLUMN IF EXISTS "lng";