-- CreateEnum
CREATE TYPE "TipoQuestao" AS ENUM ('MULTIPLA_ESCOLHA', 'VERDADEIRO_FALSO', 'RESPOSTA_TEXTO', 'ASSOCIACAO', 'ORDENACAO');

-- CreateTable
CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "codigo" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas_alunos" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "entrouEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turmas_alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "mostrarResultado" BOOLEAN NOT NULL DEFAULT false,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "turmaId" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questoes" (
    "id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "tipo" "TipoQuestao" NOT NULL,
    "configuracao" JSONB NOT NULL,
    "respostaCorreta" JSONB NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL,
    "atividadeId" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentativas" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,
    "questoesAcertadas" INTEGER NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "percentualAcerto" DOUBLE PRECISION NOT NULL,
    "concluidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas" (
    "id" TEXT NOT NULL,
    "tentativaId" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,
    "resposta" JSONB NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "respondidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "turmas_codigo_key" ON "turmas"("codigo");

-- CreateIndex
CREATE INDEX "turmas_professorId_idx" ON "turmas"("professorId");

-- CreateIndex
CREATE INDEX "turmas_alunos_turmaId_idx" ON "turmas_alunos"("turmaId");

-- CreateIndex
CREATE UNIQUE INDEX "turmas_alunos_alunoId_turmaId_key" ON "turmas_alunos"("alunoId", "turmaId");

-- CreateIndex
CREATE INDEX "atividades_turmaId_idx" ON "atividades"("turmaId");

-- CreateIndex
CREATE INDEX "questoes_atividadeId_idx" ON "questoes"("atividadeId");

-- CreateIndex
CREATE UNIQUE INDEX "questoes_atividadeId_ordem_key" ON "questoes"("atividadeId", "ordem");

-- CreateIndex
CREATE INDEX "tentativas_alunoId_idx" ON "tentativas"("alunoId");

-- CreateIndex
CREATE INDEX "tentativas_atividadeId_idx" ON "tentativas"("atividadeId");

-- CreateIndex
CREATE INDEX "tentativas_alunoId_atividadeId_idx" ON "tentativas"("alunoId", "atividadeId");

-- CreateIndex
CREATE INDEX "respostas_questaoId_idx" ON "respostas"("questaoId");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_tentativaId_questaoId_key" ON "respostas"("tentativaId", "questaoId");

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas_alunos" ADD CONSTRAINT "turmas_alunos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas_alunos" ADD CONSTRAINT "turmas_alunos_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades" ADD CONSTRAINT "atividades_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "atividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas" ADD CONSTRAINT "tentativas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas" ADD CONSTRAINT "tentativas_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "atividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_tentativaId_fkey" FOREIGN KEY ("tentativaId") REFERENCES "tentativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
