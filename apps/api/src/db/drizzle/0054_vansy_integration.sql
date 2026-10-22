CREATE TABLE "vansy_attempt_result" (
	"attempt_id" text PRIMARY KEY NOT NULL,
	"vansy_quiz_id" text NOT NULL,
	"stage_id" integer,
	"roster_id" integer,
	"user_id" integer,
	"status" text NOT NULL,
	"score" double precision NOT NULL,
	"max_score" double precision NOT NULL,
	"percent" double precision NOT NULL,
	"duration_ms" integer NOT NULL,
	"review_status" text NOT NULL,
	"submitted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vansy_stage_quiz" (
	"stage_id" integer PRIMARY KEY NOT NULL,
	"vansy_quiz_id" text NOT NULL,
	"linked_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vansy_stage_standing" (
	"stage_id" integer NOT NULL,
	"roster_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"score" double precision NOT NULL,
	"duration_ms" integer NOT NULL,
	"review_status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vansy_stage_standing_stage_id_roster_id_pk" PRIMARY KEY("stage_id","roster_id")
);
--> statement-breakpoint
CREATE TABLE "vansy_webhook_event" (
	"event_id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vansy_attempt_result" ADD CONSTRAINT "vansy_attempt_result_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vansy_attempt_result" ADD CONSTRAINT "vansy_attempt_result_roster_id_roster_id_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vansy_attempt_result" ADD CONSTRAINT "vansy_attempt_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vansy_stage_quiz" ADD CONSTRAINT "vansy_stage_quiz_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vansy_stage_quiz" ADD CONSTRAINT "vansy_stage_quiz_linked_by_id_user_id_fk" FOREIGN KEY ("linked_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vansy_stage_standing" ADD CONSTRAINT "vansy_stage_standing_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vansy_stage_standing" ADD CONSTRAINT "vansy_stage_standing_roster_id_roster_id_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vansy_attempt_result_stage_index" ON "vansy_attempt_result" USING btree ("stage_id");