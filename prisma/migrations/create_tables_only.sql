-- ============================================
-- SCRIPT PARA CRIAR APENAS AS TABELAS
-- (ENUMs já existem, então pulamos essa parte)
-- ============================================

-- Tabela User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" "PermissionRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Team
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intensity" "PredictiveIntensity" NOT NULL DEFAULT 'BALANCEADO'
);

-- Tabela TeamMember
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PermissionRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("teamId", "userId")
);

-- Tabela ReportTemplate
CREATE TABLE IF NOT EXISTS "ReportTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metrics" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportTemplate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela ReportSchedule
CREATE TABLE IF NOT EXISTS "ReportSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "templateId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "cadence" "ReportCadence" NOT NULL,
    "cadenceCustom" TEXT,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "channels" "NotificationChannel"[] NOT NULL DEFAULT ARRAY['EMAIL']::"NotificationChannel"[],
    CONSTRAINT "ReportSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportSchedule_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela ReportExport
CREATE TABLE IF NOT EXISTS "ReportExport" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "scheduleId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "deliveredTo" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportExport_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ReportSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'MEDIUM',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela Tutorial
CREATE TABLE IF NOT EXISTS "Tutorial" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tutorial_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela TutorialProgress
CREATE TABLE IF NOT EXISTS "TutorialProgress" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "tutorialId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "TutorialProgress_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TutorialProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("tutorialId", "userId")
);

-- Tabela OnboardingStep
CREATE TABLE IF NOT EXISTS "OnboardingStep" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OnboardingStep_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela OnboardingProgress
CREATE TABLE IF NOT EXISTS "OnboardingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "stepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "OnboardingProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("stepId", "userId")
);

-- Tabela AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "detail" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela PredictiveSession
CREATE TABLE IF NOT EXISTS "PredictiveSession" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "sessionCode" TEXT NOT NULL UNIQUE,
    "abandonmentScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PredictiveSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela PredictiveIntervention
CREATE TABLE IF NOT EXISTS "PredictiveIntervention" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sessionId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "respondedAt" TIMESTAMP(3),
    CONSTRAINT "PredictiveIntervention_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PredictiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela PredictiveLabel
CREATE TABLE IF NOT EXISTS "PredictiveLabel" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PredictiveLabel_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PredictiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PredictiveLabel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("sessionId", "userId")
);

-- Tabela AbTest
CREATE TABLE IF NOT EXISTS "AbTest" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AbTestStatus" NOT NULL DEFAULT 'DRAFT',
    "context" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AbTest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AbTest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela AbTestVariant
CREATE TABLE IF NOT EXISTS "AbTestVariant" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "testId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "conversionRate" DOUBLE PRECISION,
    "responseTime" INTEGER,
    "content" JSONB,
    CONSTRAINT "AbTestVariant_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AbTest"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela WebhookEndpoint
CREATE TABLE IF NOT EXISTS "WebhookEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookEndpoint_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela WebhookDelivery
CREATE TABLE IF NOT EXISTS "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "endpointId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela ChatThread
CREATE TABLE IF NOT EXISTS "ChatThread" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatThread_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela ChatMessage
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "threadId" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela Tag
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "teamId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    CONSTRAINT "Tag_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela ChatTag
CREATE TABLE IF NOT EXISTS "ChatTag" (
    "threadId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ChatTag_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("threadId", "tagId")
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS "Notification_teamId_createdAt_idx" ON "Notification"("teamId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_teamId_createdAt_idx" ON "AuditLog"("teamId", "createdAt");

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso!' as status;
