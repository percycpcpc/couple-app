DROP INDEX "WeeklyTheme_weekNumber_key";

CREATE UNIQUE INDEX "WeeklyTheme_weekNumber_bucketId_key"
ON "WeeklyTheme"("weekNumber", "bucketId");
