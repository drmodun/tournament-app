ALTER TABLE "subscription" ADD COLUMN "auto_renewal" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "next_payment_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "customer_id" text;