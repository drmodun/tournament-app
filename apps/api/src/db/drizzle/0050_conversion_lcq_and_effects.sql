ALTER TABLE "conversion_rule" ADD COLUMN "last_chance_destination" integer;--> statement-breakpoint
ALTER TABLE "conversion_rule" ADD COLUMN "effects" jsonb;