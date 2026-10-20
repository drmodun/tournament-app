DROP TABLE "achievement" CASCADE;--> statement-breakpoint
DROP TABLE "achievement_user" CASCADE;--> statement-breakpoint
DROP TABLE "bets" CASCADE;--> statement-breakpoint
DROP TABLE "chat_room" CASCADE;--> statement-breakpoint
DROP TABLE "chatRoomMessage" CASCADE;--> statement-breakpoint
DROP TABLE "chat_room_user" CASCADE;--> statement-breakpoint
DROP TABLE "competitive_programming_contest" CASCADE;--> statement-breakpoint
DROP TABLE "contest_allowed_language" CASCADE;--> statement-breakpoint
DROP TABLE "direct_message" CASCADE;--> statement-breakpoint
DROP TABLE "like" CASCADE;--> statement-breakpoint
DROP TABLE "problem" CASCADE;--> statement-breakpoint
DROP TABLE "reports" CASCADE;--> statement-breakpoint
DROP TABLE "result_post" CASCADE;--> statement-breakpoint
DROP TABLE "result_post_image" CASCADE;--> statement-breakpoint
DROP TABLE "review" CASCADE;--> statement-breakpoint
DROP TABLE "sponsor" CASCADE;--> statement-breakpoint
DROP TABLE "sponsor_promotion" CASCADE;--> statement-breakpoint
DROP TABLE "sponsor_tournament" CASCADE;--> statement-breakpoint
DROP TABLE "submission" CASCADE;--> statement-breakpoint
DROP TABLE "submission_testcase" CASCADE;--> statement-breakpoint
DROP TABLE "subscription" CASCADE;--> statement-breakpoint
DROP TABLE "subscription_benefits" CASCADE;--> statement-breakpoint
DROP TABLE "subscription_user" CASCADE;--> statement-breakpoint
DROP TABLE "test_cluster" CASCADE;--> statement-breakpoint
DROP TABLE "test_cluster_problem" CASCADE;--> statement-breakpoint
DROP TABLE "testcase" CASCADE;--> statement-breakpoint
DROP TABLE "tournament_post" CASCADE;--> statement-breakpoint
DROP TABLE "tournament_post_image" CASCADE;--> statement-breakpoint
DROP TABLE "tournament_promotion" CASCADE;--> statement-breakpoint
ALTER TABLE "stage" DROP CONSTRAINT "stage_conversion_rule_id_conversion_rule_id_fk";
--> statement-breakpoint
ALTER TABLE "tournament" DROP CONSTRAINT "tournament_conversion_rule_id_conversion_rule_id_fk";
--> statement-breakpoint
ALTER TABLE "stage" DROP COLUMN "conversion_rule_id";--> statement-breakpoint
ALTER TABLE "tournament" DROP COLUMN "conversion_rule_id";--> statement-breakpoint
DROP TYPE "public"."bet_status";--> statement-breakpoint
DROP TYPE "public"."bet_type";--> statement-breakpoint
DROP TYPE "public"."chat_room_type";--> statement-breakpoint
DROP TYPE "public"."like_type";--> statement-breakpoint
DROP TYPE "public"."message_visibility";--> statement-breakpoint
DROP TYPE "public"."submission_status";--> statement-breakpoint
DROP TYPE "public"."tournament_promotion_type";--> statement-breakpoint
DROP TYPE "public"."user_subscription";