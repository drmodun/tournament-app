ALTER TYPE "notification_type" ADD VALUE 'welcome';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'reset-password';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'verify-email';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'notification-of-ban';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'bet-outcome';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'tournament-reminder';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'tournament-start';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'tournament-end';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-invitation';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-join-request';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-join-approval';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-join-rejection';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-removal';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-admin-promotion';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'group-admin-demotion';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'test-template';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_token" (
	"user_id" integer,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
