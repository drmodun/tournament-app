CREATE TABLE IF NOT EXISTS "notification_to_user" (
	"notification_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_to_user" ADD CONSTRAINT "notification_to_user_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_to_user" ADD CONSTRAINT "notification_to_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "notification" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "notification" DROP COLUMN IF EXISTS "read";