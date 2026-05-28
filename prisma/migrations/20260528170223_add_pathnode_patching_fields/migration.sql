-- AlterTable
ALTER TABLE "path_nodes" ADD COLUMN "connectionType" TEXT;
ALTER TABLE "path_nodes" ADD COLUMN "denoisingScore" REAL;
ALTER TABLE "path_nodes" ADD COLUMN "noisingScore" REAL;
