-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "contactDetails" TEXT,
ADD COLUMN     "negativeResponses" JSONB;

-- AlterTable
ALTER TABLE "ReviewForm" ADD COLUMN     "negativeFeedbackQuestions" JSONB NOT NULL DEFAULT '["What could we improve?", "What was the main reason for your negative experience?", "Would you like us to contact you to discuss this further?"]',
ADD COLUMN     "negativeRedirectType" TEXT NOT NULL DEFAULT 'internal';
