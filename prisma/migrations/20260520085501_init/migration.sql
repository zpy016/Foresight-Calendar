-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT,
    "weekday" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "aiRecommend" TEXT,
    "importance" TEXT,
    "country" TEXT,
    "city" TEXT,
    "location" TEXT,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "events_recordId_key" ON "events"("recordId");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_company_idx" ON "events"("company");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");
