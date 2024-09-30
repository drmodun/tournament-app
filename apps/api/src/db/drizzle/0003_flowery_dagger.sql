ALTER TABLE "participation" DROP CONSTRAINT "participation_group_group_id_fk";
--> statement-breakpoint
ALTER TABLE "participation" DROP CONSTRAINT "participation_user_id_user_id_fk";
ALTER TABLE "like"
ADD COLUMN "post_id" integer NOT NULL;
--> statement-breakpoint
ALTER TABLE "like"
ADD COLUMN "like_type" "like_type" NOT NULL;
--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "like" DROP CONSTRAINT "like_user_id_tournament_post_id_pk";
--> statement-breakpoint
ALTER TABLE "participation" DROP CONSTRAINT "participation_group_tournament_id_pk";
--> statement-breakpoint
ALTER TABLE "like"
ADD CONSTRAINT "like_user_id_post_id_like_type_pk" PRIMARY KEY("user_id", "post_id", "like_type");
--> statement-breakpoint
ALTER TABLE "participation"
ADD COLUMN "group_id" integer NOT NULL;
--> statement-breakpoint
ALTER TABLE "participation"
ADD CONSTRAINT "participation_group_id_tournament_id_pk" PRIMARY KEY("group_id", "tournament_id");
--> statement-breakpoint
ALTER TABLE "review"
ADD CONSTRAINT "review_user_id_event_id_pk" PRIMARY KEY("user_id", "event_id");
--> statement-breakpoint
ALTER TABLE "submission"
ADD COLUMN "created_at" timestamp with time zone DEFAULT now();
--> statement-breakpoint
ALTER TABLE "submission"
ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "participation"
ADD CONSTRAINT "participation_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "like" DROP COLUMN IF EXISTS "tournament_post_id";
--> statement-breakpoint
ALTER TABLE "like" DROP COLUMN IF EXISTS "result_post_id";
--> statement-breakpoint
ALTER TABLE "participation" DROP COLUMN IF EXISTS "group";
--> statement-breakpoint
ALTER TABLE "participation" DROP COLUMN IF EXISTS "user_id";