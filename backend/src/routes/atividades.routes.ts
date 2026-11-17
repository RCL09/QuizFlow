
import { Router } from "express";
import { prisma } from "../prisma.ts";
import {
  autenticar,
  permitirRoles,
} from "../middlewares/auth.middleware.ts";

const router = Router();

const MODOS_FEEDBACK = [
  "IMEDIATO",
  "AO_FINALIZAR",
  "DESATIVADO",
] as const;

type ModoFeedback = (typeof MODOS_FEEDBACK)[number];

// POST /api/turmas/:turmaId/atividades
// Cria uma atividade dentro de uma turma.
router.post(
  "/turmas/:turmaId/atividades",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;
      const turmaId = String(req.params.turmaId ?? "").trim();

      const {
        titulo,
        descricao,
        mostrarResultado,
        modoFeedback,
      } = req.body ?? {};

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
        return res.status(400).json({
          message: "Informe o título da atividade.",
        });
      }

      if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== "string"
      ) {
        return res.status(400).json({
          message: "A descrição da atividade é inválida.",
        });
      }

      if (
        mostrarResultado !== undefined &&
        typeof mostrarResultado !== "boolean"
      ) {
        return res.status(400).json({
          message: "A configuração de visibilidade do resultado é inválida.",
        });
      }

      if (
        modoFeedback !== undefined &&
        !MODOS_FEEDBACK.includes(modoFeedback)
      ) {
        return res.status(400).json({
          message: "Modo de feedback inválido.",
          modosPermitidos: MODOS_FEEDBACK,
        });
      }

      // Confirma que a turma pertence ao professor autenticado.
      const turma = await prisma.turma.findFirst({
        where: {
          id: turmaId,
          professorId,
        },
        select: {
          id: true,
          nome: true,
        },
      });

      if (!turma) {
        return res.status(404).json({
          message: "Turma não encontrada ou você não tem acesso a ela.",
        });
      }

      const atividade = await prisma.atividade.create({
        data: {
          titulo: titulo.trim(),
          descricao:
            typeof descricao === "string" && descricao.trim()
              ? descricao.trim()
              : null,
          mostrarResultado: mostrarResultado ?? false,
          modoFeedback: (modoFeedback ?? "AO_FINALIZAR") as ModoFeedback,
          turmaId,
        },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          mostrarResultado: true,
          modoFeedback: true,
          publicada: true,
          turmaId: true,
          criadaEm: true,
        },
      });

      return res.status(201).json({
        message: "Atividade criada com sucesso!",
        atividade,
      });
    } catch (error) {
      console.error("Erro ao criar atividade:", error);

      return res.status(500).json({
        message: "Não foi possível criar a atividade.",
      });
    }
  }
);

// GET /api/turmas/:turmaId/atividades
// Professor consulta todas as atividades da turma.
// Aluno consulta somente as atividades publicadas.
router.get(
  "/turmas/:turmaId/atividades",
  autenticar,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const turmaId = String(req.params.turmaId ?? "").trim();

      if (!userId || !role) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const turma = await prisma.turma.findUnique({
        where: {
          id: turmaId,
        },
        select: {
          id: true,
          professorId: true,
          alunos: {
            where: {
              alunoId: userId,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!turma) {
        return res.status(404).json({
          message: "Turma não encontrada.",
        });
      }

      if (role === "PROFESSOR") {
        if (turma.professorId !== userId) {
          return res.status(403).json({
            message: "Você não tem acesso às atividades desta turma.",
          });
        }
      } else if (role === "ALUNO") {
        if (turma.alunos.length === 0) {
          return res.status(403).json({
            message: "Você não participa desta turma.",
          });
        }
      } else {
        return res.status(403).json({
          message: "Perfil sem permissão para consultar atividades.",
        });
      }

      const atividades = await prisma.atividade.findMany({
        where: {
          turmaId,
          ...(role === "ALUNO" ? { publicada: true } : {}),
        },
        orderBy: {
          criadaEm: "desc",
        },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          mostrarResultado: true,
          modoFeedback: true,
          publicada: true,
          criadaEm: true,
          _count: {
            select: {
              questoes: true,
            },
          },
        },
      });

      return res.status(200).json({
        turmaId,
        totalAtividades: atividades.length,
        atividades,
      });
    } catch (error) {
      console.error("Erro ao consultar atividades:", error);

      return res.status(500).json({
        message: "Não foi possível consultar as atividades.",
      });
    }
  }
);

// GET /api/atividades/:atividadeId
// Professor consulta a atividade com as respostas corretas.
// Aluno consulta a atividade sem receber as respostas corretas.
router.get(
  "/atividades/:atividadeId",
  autenticar,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const atividadeId = String(req.params.atividadeId ?? "").trim();

      if (!userId || !role) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const atividade = await prisma.atividade.findUnique({
        where: {
          id: atividadeId,
        },
        include: {
          turma: {
            select: {
              professorId: true,
              alunos: {
                where: {
                  alunoId: userId,
                },
                select: {
                  id: true,
                },
              },
            },
          },
          questoes: {
            orderBy: {
              ordem: "asc",
            },
          },
        },
      });

      if (!atividade) {
        return res.status(404).json({
          message: "Atividade não encontrada.",
        });
      }

      if (role === "PROFESSOR") {
        if (atividade.turma.professorId !== userId) {
          return res.status(403).json({
            message: "Você não tem acesso a esta atividade.",
          });
        }
      } else if (role === "ALUNO") {
        if (
          atividade.turma.alunos.length === 0 ||
          !atividade.publicada
        ) {
          return res.status(404).json({
            message: "Atividade não encontrada ou ainda não disponível.",
          });
        }
      } else {
        return res.status(403).json({
          message: "Perfil sem permissão para consultar esta atividade.",
        });
      }

      const questoes = atividade.questoes.map((questao) => {
        const {
          respostaCorreta,
          explicacao,
          ...dadosQuestao
        } = questao;

        if (role === "PROFESSOR") {
          return {
            ...dadosQuestao,
            respostaCorreta,
            explicacao,
          };
        }

        // Nunca envia a resposta correta ou a explicação
        // antes de a questão ser respondida.
        return dadosQuestao;
      });

      return res.status(200).json({
        atividade: {
          id: atividade.id,
          titulo: atividade.titulo,
          descricao: atividade.descricao,
          mostrarResultado: atividade.mostrarResultado,
          modoFeedback: atividade.modoFeedback,
          publicada: atividade.publicada,
          criadaEm: atividade.criadaEm,
          questoes,
        },
      });
    } catch (error) {
      console.error("Erro ao consultar atividade:", error);

      return res.status(500).json({
        message: "Não foi possível consultar a atividade.",
      });
    }
  }
);

// PATCH /api/atividades/:atividadeId
// Professor edita as configurações enquanto a atividade for um rascunho.
router.patch(
  "/atividades/:atividadeId",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;
      const atividadeId = String(req.params.atividadeId ?? "").trim();

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const {
        titulo,
        descricao,
        mostrarResultado,
        modoFeedback,
      } = req.body ?? {};

      const atividade = await prisma.atividade.findFirst({
        where: {
          id: atividadeId,
          turma: {
            professorId,
          },
        },
        select: {
          id: true,
          publicada: true,
        },
      });

      if (!atividade) {
        return res.status(404).json({
          message: "Atividade não encontrada ou você não tem acesso a ela.",
        });
      }

      if (atividade.publicada) {
        return res.status(409).json({
          message: "Não é possível editar uma atividade publicada.",
        });
      }

      const dadosAtualizacao: {
        titulo?: string;
        descricao?: string | null;
        mostrarResultado?: boolean;
        modoFeedback?: ModoFeedback;
      } = {};

      if (titulo !== undefined) {
        if (typeof titulo !== "string" || !titulo.trim()) {
          return res.status(400).json({
            message: "O título da atividade é inválido.",
          });
        }

        dadosAtualizacao.titulo = titulo.trim();
      }

      if (descricao !== undefined) {
        if (descricao !== null && typeof descricao !== "string") {
          return res.status(400).json({
            message: "A descrição da atividade é inválida.",
          });
        }

        dadosAtualizacao.descricao =
          typeof descricao === "string" && descricao.trim()
            ? descricao.trim()
            : null;
      }

      if (mostrarResultado !== undefined) {
        if (typeof mostrarResultado !== "boolean") {
          return res.status(400).json({
            message: "A configuração de visibilidade do resultado é inválida.",
          });
        }

        dadosAtualizacao.mostrarResultado = mostrarResultado;
      }

      if (modoFeedback !== undefined) {
        if (!MODOS_FEEDBACK.includes(modoFeedback)) {
          return res.status(400).json({
            message: "Modo de feedback inválido.",
            modosPermitidos: MODOS_FEEDBACK,
          });
        }

        dadosAtualizacao.modoFeedback = modoFeedback;
      }

      if (Object.keys(dadosAtualizacao).length === 0) {
        return res.status(400).json({
          message: "Informe pelo menos um campo para atualizar.",
        });
      }

      const atividadeAtualizada = await prisma.atividade.update({
        where: {
          id: atividadeId,
        },
        data: dadosAtualizacao,
        select: {
          id: true,
          titulo: true,
          descricao: true,
          mostrarResultado: true,
          modoFeedback: true,
          publicada: true,
          atualizadaEm: true,
        },
      });

      return res.status(200).json({
        message: "Atividade atualizada com sucesso!",
        atividade: atividadeAtualizada,
      });
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);

      return res.status(500).json({
        message: "Não foi possível atualizar a atividade.",
      });
    }
  }
);

export default router;