CREATE TYPE "public"."api_token_scope" AS ENUM('read', 'write');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'api-token-rate-limit-warning';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'api-token-rate-limit-reached';--> statement-breakpoint
CREATE TABLE "api_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"prefix" text NOT NULL,
	"scopes" "api_token_scope"[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"rate_limit_warned_at" timestamp with time zone,
	"rate_limit_reached_at" timestamp with time zone,
	CONSTRAINT "api_token_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "api_token_usage" (
	"token_id" integer NOT NULL,
	"day" date NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "api_token_usage_token_id_day_pk" PRIMARY KEY("token_id","day")
);
--> statement-breakpoint
ALTER TABLE "api_token" ADD CONSTRAINT "api_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_token_usage" ADD CONSTRAINT "api_token_usage_token_id_api_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."api_token"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_token_user_index" ON "api_token" USING btree ("user_id");