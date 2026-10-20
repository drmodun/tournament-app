ALTER TYPE "public"."notification_type" ADD VALUE 'group-ownership-transfer';--> statement-breakpoint
CREATE TABLE "rating_change" (
	"id" serial PRIMARY KEY NOT NULL,
	"matchup_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"delta" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "rating_change" ADD CONSTRAINT "rating_change_matchup_id_matchup_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."matchup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_change" ADD CONSTRAINT "rating_change_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_change" ADD CONSTRAINT "rating_change_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rating_change_matchup_index" ON "rating_change" USING btree ("matchup_id");