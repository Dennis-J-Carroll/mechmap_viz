-- CreateTable
CREATE TABLE "contributors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelName" TEXT NOT NULL DEFAULT 'GPT-2 Small',
    "numLayers" INTEGER NOT NULL DEFAULT 12,
    "numHeads" INTEGER NOT NULL DEFAULT 12,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contributorId" TEXT,
    CONSTRAINT "projects_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "layerIndex" INTEGER NOT NULL,
    "headIndex" INTEGER,
    "notes" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "importance" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contributorId" TEXT,
    CONSTRAINT "annotations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "annotations_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "circuit_paths" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "circuitType" TEXT NOT NULL DEFAULT 'unknown',
    "hypothesis" TEXT,
    "evidence" TEXT,
    "confidence" TEXT NOT NULL DEFAULT 'speculative',
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contributorId" TEXT,
    CONSTRAINT "circuit_paths_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "circuit_paths_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "path_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circuitPathId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "componentType" TEXT NOT NULL,
    "layerIndex" INTEGER NOT NULL,
    "headIndex" INTEGER,
    "role" TEXT,
    "signalType" TEXT,
    "notes" TEXT,
    "annotationId" TEXT,
    CONSTRAINT "path_nodes_circuitPathId_fkey" FOREIGN KEY ("circuitPathId") REFERENCES "circuit_paths" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "path_nodes_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "annotations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contributorId" TEXT,
    "annotationId" TEXT,
    "circuitPathId" TEXT,
    "parentId" TEXT,
    CONSTRAINT "comments_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "comments_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "annotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_circuitPathId_fkey" FOREIGN KEY ("circuitPathId") REFERENCES "circuit_paths" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "contributors_email_key" ON "contributors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "annotations_projectId_componentType_layerIndex_headIndex_key" ON "annotations"("projectId", "componentType", "layerIndex", "headIndex");

-- CreateIndex
CREATE UNIQUE INDEX "path_nodes_circuitPathId_position_key" ON "path_nodes"("circuitPathId", "position");
