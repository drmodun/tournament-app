CREATE TYPE "public"."point_conversion_strategy" AS ENUM(
	'qualification',
	'ranking',
	'elimination',
	'hybrid',
	'seed',
	'tie_breaker',
	'qualification_with_lcq'
);
--> statement-breakpoint
CREATE TYPE "public"."point_conversion_strategy_type" AS ENUM(
	'stage_to_stage',
	'stage_to_tournament',
	'tournament_to_tournament'
);
--> statement-breakpoint
CREATE TYPE "public"."stage_type" AS ENUM(
	'group',
	'knockout',
	'swiss',
	'round_robin',
	'fixture',
	'double_elimination',
	'quiz',
	'evaluated_competition'
);
--> statement-breakpoint
ALTER TYPE "public"."event_status"
RENAME TO "stage_status";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversion_rule" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"source" integer NOT NULL,
	"destination" integer NOT NULL,
	"points" integer DEFAULT 0,
	"type" "point_conversion_strategy_type" DEFAULT 'stage_to_stage',
	"strategy" "point_conversion_strategy" DEFAULT 'ranking',
	"from" integer,
	"to" integer,
	"min_points" integer,
	"max_points" integer,
	"points_per_place" integer,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "event"
	RENAME TO "stage";
--> statement-breakpoint
ALTER TABLE "stage"
	RENAME COLUMN "event_status" TO "stage_status";
--> statement-breakpoint
ALTER TABLE "stage"
	RENAME COLUMN "event_type" TO "stage_type";
--> statement-breakpoint
ALTER TABLE "stage"
	RENAME COLUMN "event_location" TO "stage_location";
--> statement-breakpoint
ALTER TABLE "matchup"
	RENAME COLUMN "event_id" TO "stage_id";
--> statement-breakpoint
ALTER TABLE "result_post"
	RENAME COLUMN "event_id" TO "stage_id";
--> statement-breakpoint
ALTER TABLE "review"
	RENAME COLUMN "event_id" TO "stage_id";
--> statement-breakpoint
ALTER TABLE "roster"
	RENAME COLUMN "event_id" TO "stage_id";
--> statement-breakpoint
ALTER TABLE "stage" DROP CONSTRAINT "event_tournament_id_tournament_id_fk";
--> statement-breakpoint
ALTER TABLE "stage" DROP CONSTRAINT "event_chat_room_id_chat_room_id_fk";
--> statement-breakpoint
ALTER TABLE "matchup" DROP CONSTRAINT "matchup_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "result_post" DROP CONSTRAINT "result_post_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "roster" DROP CONSTRAINT "roster_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "participation" DROP CONSTRAINT "participation_group_id_tournament_id_pk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_event_id_pk";
--> statement-breakpoint
ALTER TABLE "notification"
ALTER COLUMN "type"
SET DATA TYPE text;
--> statement-breakpoint
ALTER TABLE "notification"
ALTER COLUMN "type"
SET DEFAULT 'test-template';
--> statement-breakpoint
ALTER TABLE "participation"
ALTER COLUMN "group_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "review"
ADD CONSTRAINT "review_user_id_stage_id_pk" PRIMARY KEY("user_id", "stage_id");
--> statement-breakpoint
ALTER TABLE "stage"
ADD COLUMN "conversion_rule_id" integer;
--> statement-breakpoint
ALTER TABLE "participation"
ADD COLUMN "participation_id" serial PRIMARY KEY NOT NULL;
--> statement-breakpoint
ALTER TABLE "participation"
ADD COLUMN "user_id" integer;
--> statement-breakpoint
ALTER TABLE "tournament"
ADD COLUMN "parent_tournament_id" integer;
--> statement-breakpoint
ALTER TABLE "tournament"
ADD COLUMN "conversion_rule_id" integer;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "stage"
ADD CONSTRAINT "stage_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "stage"
ADD CONSTRAINT "stage_conversion_rule_id_conversion_rule_id_fk" FOREIGN KEY ("conversion_rule_id") REFERENCES "public"."conversion_rule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "stage"
ADD CONSTRAINT "stage_chat_room_id_chat_room_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "matchup"
ADD CONSTRAINT "matchup_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "participation"
ADD CONSTRAINT "participation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "result_post"
ADD CONSTRAINT "result_post_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "review"
ADD CONSTRAINT "review_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "roster"
ADD CONSTRAINT "roster_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "tournament"
ADD CONSTRAINT "tournament_parent_tournament_id_tournament_id_fk" FOREIGN KEY ("parent_tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "tournament"
ADD CONSTRAINT "tournament_conversion_rule_id_conversion_rule_id_fk" FOREIGN KEY ("conversion_rule_id") REFERENCES "public"."conversion_rule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "public"."stage"
ALTER COLUMN "stage_status"
SET DATA TYPE text;
--> statement-breakpoint
DROP TYPE "public"."stage_status" CASCADE;
--> statement-breakpoint
CREATE TYPE "public"."stage_status" AS ENUM(
	'league',
	'competition',
	'seasonal',
	'contest',
	'event'
);
--> statement-breakpoint
ALTER TABLE "public"."stage"
ALTER COLUMN "stage_status"
SET DATA TYPE "public"."stage_status" USING "stage_status"::"public"."stage_status";