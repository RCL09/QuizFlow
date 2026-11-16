/*
  Warnings:

  - You are about to drop the column `percentualAcerto` on the `tentativas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[liberacaoId]` on the table `tentativas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[alunoId,atividadeId,numero]` on the table `tentativas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ModoFeedback" AS ENUM ('IMEDIATO', 'AO_FINALIZAR', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "ModoCorrecaoTexto" AS ENUM ('AUTOMATICA', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusTentativa" AS ENUM ('EM_ANDAMENTO', 'AGUARDANDO_CORRECAO', 'CONCLUIDA');

-- DropIndex
DROP INDEX "tentativas_alunoId_atividadeId_idx";

-- AlterTable
ALTER TABLE "atividades" ADD COLUMN     "modoFeedback" "ModoFeedback" NOT NULL DEFAULT 'AO_FINALIZAR';

-- AlterTable
ALTER TABLE "questoes" ADD COLUMN     "explicacao" TEXT,
ADD COLUMN     "modoCorrecaoTexto" "ModoCorrecaoTexto",
ALTER COLUMN "respostaCorreta" DROP NOT NULL;

-- AlterTable
ALTER TABLE "respostas" ADD COLUMN     "comentarioProfessor" TEXT,
ADD COLUMN     "corrigidaEm" TIMESTAMP(3),
ADD COLUMN     "corrigidaPorId" TEXT,
ADD COLUMN     "pontosObtidos" DOUBLE PRECISION,
ALTER COLUMN "correta" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tentativas" DROP COLUMN "percentualAcerto",
ADD COLUMN     "enviadaEm" TIMESTAMP(3),
ADD COLUMN     "iniciadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "liberacaoId" TEXT,
ADD COLUMN     "numero" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "percentualNota" DOUBLE PRECISION,
ADD COLUMN     "pontosObtidos" DOUBLE PRECISION,
ADD COLUMN     "pontosTotais" DOUBLE PRECISION,
ADD COLUMN     "status" "StatusTentativa" NOT NULL DEFAULT 'EM_ANDAMENTO',
ALTER COLUMN "questoesAcertadas" DROP NOT NULL,
ALTER COLUMN "totalQuestoes" DROP NOT NULL,
ALTER COLUMN "concluidaEm" DROP NOT NULL,
ALTER COLUMN "concluidaEm" DROP DEFAULT;

-- CreateTable
CREATE TABLE "liberacoes_tentativas" (
    "id" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "motivo" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilizadaEm" TIMESTAMP(3),

    CONSTRAINT "liberacoes_tentativas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "liberacoes_tentativas_atividadeId_alunoId_utilizadaEm_idx" ON "liberacoes_tentativas"("atividadeId", "alunoId", "utilizadaEm");

-- CreateIndex
CREATE INDEX "liberacoes_tentativas_professorId_idx" ON "liberacoes_tentativas"("professorId");

-- CreateIndex
CREATE INDEX "respostas_corrigidaPorId_idx" ON "respostas"("corrigidaPorId");

-- CreateIndex
CREATE UNIQUE INDEX "tentativas_liberacaoId_key" ON "tentativas"("liberacaoId");

-- CreateIndex
CREATE INDEX "tentativas_status_idx" ON "tentativas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tentativas_alunoId_atividadeId_numero_key" ON "tentativas"("alunoId", "atividadeId", "numero");

-- AddForeignKey
ALTER TABLE "tentativas" ADD CONSTRAINT "tentativas_liberacaoId_fkey" FOREIGN KEY ("liberacaoId") REFERENCES "liberacoes_tentativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_corrigidaPorId_fkey" FOREIGN KEY ("corrigidaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liberacoes_tentativas" ADD CONSTRAINT "liberacoes_tentativas_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "atividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liberacoes_tentativas" ADD CONSTRAINT "liberacoes_tentativas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liberacoes_tentativas" ADD CONSTRAINT "liberacoes_tentativas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
