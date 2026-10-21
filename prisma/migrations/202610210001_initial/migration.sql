-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "StateDocument" (
    "id" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StateDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordEntry" (
    "id" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "hint" TEXT,
    "description" TEXT,
    "region" TEXT NOT NULL,
    "age" INTEGER NOT NULL DEFAULT 6,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "popularity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "lastPlayed" TIMESTAMP(3),
    "related" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "WordEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordTranslation" (
    "wordId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "WordTranslation_pkey" PRIMARY KEY ("wordId","language")
);

-- CreateTable
CREATE TABLE "Alias" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordCategory" (
    "wordId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "WordCategory_pkey" PRIMARY KEY ("wordId","categoryId")
);

-- CreateTable
CREATE TABLE "WordPack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "WordPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackMembership" (
    "packId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "PackMembership_pkey" PRIMARY KEY ("packId","wordId")
);

-- CreateTable
CREATE TABLE "ContentSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "license" TEXT,

    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReport" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRound" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "secretWordId" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),

    CONSTRAINT "GameRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "roundId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "imposter" BOOLEAN NOT NULL,

    CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("roundId","participantId")
);

-- CreateTable
CREATE TABLE "Vote" (
    "roundId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "targetId" TEXT,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("roundId","participantId")
);

-- CreateTable
CREATE TABLE "Score" (
    "roundId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("roundId","participantId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WordEntry_normalized_key" ON "WordEntry"("normalized");

-- CreateIndex
CREATE INDEX "WordEntry_status_active_difficulty_idx" ON "WordEntry"("status", "active", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_normalized_key" ON "Alias"("normalized");

-- CreateIndex
CREATE INDEX "WordCategory_categoryId_wordId_idx" ON "WordCategory"("categoryId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "GameRoom_code_key" ON "GameRoom"("code");

-- CreateIndex
CREATE INDEX "GameRoom_expiresAt_idx" ON "GameRoom"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RoomParticipant_tokenHash_key" ON "RoomParticipant"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "RoomParticipant_roomId_nickname_key" ON "RoomParticipant"("roomId", "nickname");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordEntry" ADD CONSTRAINT "WordEntry_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ContentSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCategory" ADD CONSTRAINT "WordCategory_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCategory" ADD CONSTRAINT "WordCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackMembership" ADD CONSTRAINT "PackMembership_packId_fkey" FOREIGN KEY ("packId") REFERENCES "WordPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackMembership" ADD CONSTRAINT "PackMembership_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReport" ADD CONSTRAINT "ContentReport_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "RoomParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "RoomParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GameRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "RoomParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
