CREATE TABLE IF NOT EXISTS "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"api_id" text NOT NULL,
	"lat" numeric NOT NULL,
	"lng" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "stage" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "location_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group" ADD CONSTRAINT "group_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stage" ADD CONSTRAINT "stage_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament" ADD CONSTRAINT "tournament_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "group" DROP COLUMN IF EXISTS "location";--> statement-breakpoint
ALTER TABLE "tournament" DROP COLUMN IF EXISTS "location";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "has_selected_interests";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "location";