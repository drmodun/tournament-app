CREATE TABLE IF NOT EXISTS "elo_requirement" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"category_id" integer,
	"minimum_elo" integer,
	"maximum_elo" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"minimum_age" integer,
	"maximum_age" integer,
	"is_same_country" boolean DEFAULT false,
	CONSTRAINT "group_requirements_group_id_unique" UNIQUE("group_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "elo_requirement" ADD CONSTRAINT "elo_requirement_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "elo_requirement" ADD CONSTRAINT "elo_requirement_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_requirements" ADD CONSTRAINT "group_requirements_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
