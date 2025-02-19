DO $$ BEGIN
 CREATE TYPE "public"."group_focus" AS ENUM('participation', 'organization', 'hybrid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."group_type" AS ENUM('private', 'public');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_interests" (
	"group_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "group_interests_group_id_category_id_pk" PRIMARY KEY("group_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "group_type" "group_type" DEFAULT 'public';--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "group_focus" "group_focus" DEFAULT 'hybrid';--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_interests" ADD CONSTRAINT "group_interests_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_interests" ADD CONSTRAINT "group_interests_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
