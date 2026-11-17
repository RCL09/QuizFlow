
import { Router } from "express";
import { prisma } from "../prisma.ts";
import {
  autenticar,
  permitirRoles,
} from "../middlewares/auth.middleware.ts";

const router = Router();

function arredondar(valor: number): number {
  return Number(valor.toFixed(2));
}

// GET /api/atividades/:atividadeId/resultados
// Professor consulta todas as tentativas dos alunos.
router.get(
  "/atividades/:atividadeId/resultados",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;
      const atividadeId = String(
        req.params.atividadeId ?? ""
      ).trim();

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const atividade = await prisma.atividade.findFirst({
        where: {
          id: atividadeId,
          turma: {
            professorId,
          },
        },
        select: {
          id: true,
          titulo: true,
          mostrarResultado: true,
          modoFeedback: true,
        },
      });

      if (!atividade) {
        return res.status(404).json({
          message: "Atividade não encontrada ou você não tem acesso a ela.",
        });
      }

      const [tentativas, liberacoesPendentes] = await Promise.all([
        prisma.tentativa.findMany({
          where: {
            atividadeId,
          },
          orderBy: [
            { alunoId: "asc" },
            { numero: "desc" },
          ],
          select: {
            id: true,
            numero: true,
            status: true,
            questoesAcertadas: true,
            totalQuestoes: true,
            pontosObtidos: true,
            pontosTotais: true,
            percentualNota: true,
            iniciadaEm: true,
            enviadaEm: true,
            concluidaEm: true,
            aluno: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                respostas: true,
              },
            },
          },
        }),

        prisma.liberacaoTentativa.findMany({
          where: {
            atividadeId,
            utilizadaEm: null,
          },
          orderBy: {
            criadaEm: "desc",
          },
          select: {
            id: true,
            motivo: true,
            criadaEm: true,
            aluno: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
      ]);

      return res.status(200).json({
        atividade,
        totalTentativas: tentativas.length,
        tentativas,
        liberacoesPendentes,
      });
    } catch (error) {
      console.error("Erro ao consultar resultados:", error);

      return res.status(500).json({
        message: "Não foi possível consultar os resultados.",
      });
    }
  }
);

// PATCH /api/tentativas/:tentativaId/respostas/:respostaId/corrigir
// Professor corrige uma resposta textual manualmente.
router.patch(
  "/tentativas/:tentativaId/respostas/:respostaId/corrigir",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;
      const tentativaId = String(
        req.params.tentativaId ?? ""
      ).trim();
      const respostaId = String(
        req.params.respostaId ?? ""
      ).trim();

      const {
        pontosObtidos,
        comentarioProfessor,
      } = req.body ?? {};

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (
        typeof pontosObtidos !== "number" ||
        !Number.isFinite(pontosObtidos) ||
        pontosObtidos < 0
      ) {
        return res.status(400).json({
          message: "Informe uma pontuação válida, igual ou maior que zero.",
        });
      }

      if (
        comentarioProfessor !== undefined &&
        comentarioProfessor !== null &&
        (
          typeof comentarioProfessor !== "string" ||
          comentarioProfessor.length > 2000
        )
      ) {
        return res.status(400).json({
          message: "O comentário deve ter no máximo 2000 caracteres.",
        });
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const tentativa = await tx.tentativa.findFirst({
          where: {
            id: tentativaId,
            status: "AGUARDANDO_CORRECAO",
            atividade: {
              turma: {
                professorId,
              },
            },
          },
          select: {
            id: true,
            atividadeId: true,
          },
        });

        if (!tentativa) {
          return {
            erro: true as const,
            status: 404,
            message: "Tentativa não encontrada ou não está aguardando correção.",
          };
        }

        const resposta = await tx.resposta.findFirst({
          where: {
            id: respostaId,
            tentativaId,
          },
          include: {
            questao: true,
          },
        });

        if (!resposta) {
          return {
            erro: true as const,
            status: 404,
            message: "Resposta não encontrada nesta tentativa.",
          };
        }

        if (
          resposta.questao.tipo !== "RESPOSTA_TEXTO" ||
          resposta.questao.modoCorrecaoTexto !== "MANUAL"
        ) {
          return {
            erro: true as const,
            status: 400,
            message: "Esta resposta não utiliza correção textual manual.",
          };
        }

        if (pontosObtidos > resposta.questao.valor) {
          return {
            erro: true as const,
            status: 400,
            message: `A pontuação não pode ultrapassar ${resposta.questao.valor} pontos.`,
          };
        }

        const respostaAtualizada = await tx.resposta.update({
          where: {
            id: respostaId,
          },
          data: {
            pontosObtidos,
            correta:
              Math.abs(pontosObtidos - resposta.questao.valor) < 0.000001,
            comentarioProfessor:
              typeof comentarioProfessor === "string" &&
              comentarioProfessor.trim()
                ? comentarioProfessor.trim()
                : null,
            corrigidaEm: new Date(),
            corrigidaPorId: professorId,
          },
          select: {
            id: true,
            questaoId: true,
            pontosObtidos: true,
            correta: true,
            comentarioProfessor: true,
            corrigidaEm: true,
          },
        });

        const respostas = await tx.resposta.findMany({
          where: {
            tentativaId,
          },
          select: {
            correta: true,
            pontosObtidos: true,
          },
        });

        const respostasPendentes = respostas.filter(
          (item) =>
            item.correta === null ||
            item.pontosObtidos === null
        ).length;

        if (respostasPendentes > 0) {
          return {
            erro: false as const,
            concluida: false,
            resposta: respostaAtualizada,
            respostasPendentes,
          };
        }

        const questoes = await tx.questao.findMany({
          where: {
            atividadeId: tentativa.atividadeId,
          },
          select: {
            valor: true,
          },
        });

        const pontosTotais = arredondar(
          questoes.reduce(
            (total, questao) => total + questao.valor,
            0
          )
        );

        const pontosCalculados = arredondar(
          respostas.reduce(
            (total, item) => total + (item.pontosObtidos ?? 0),
            0
          )
        );

        if (pontosTotais <= 0 || respostas.length !== questoes.length) {
          return {
            erro: true as const,
            status: 409,
            message: "Não foi possível finalizar: confira as respostas e a pontuação da atividade.",
          };
        }

        const questoesAcertadas = respostas.filter(
          (item) => item.correta === true
        ).length;

        const percentualNota = arredondar(
          (pontosCalculados / pontosTotais) * 100
        );

        const agora = new Date();

        const tentativaConcluida = await tx.tentativa.update({
          where: {
            id: tentativaId,
          },
          data: {
            status: "CONCLUIDA",
            questoesAcertadas,
            totalQuestoes: questoes.length,
            pontosObtidos: pontosCalculados,
            pontosTotais,
            percentualNota,
            concluidaEm: agora,
          },
          select: {
            id: true,
            numero: true,
            status: true,
            questoesAcertadas: true,
            totalQuestoes: true,
            pontosObtidos: true,
            pontosTotais: true,
            percentualNota: true,
            concluidaEm: true,
          },
        });

        return {
          erro: false as const,
          concluida: true,
          resposta: respostaAtualizada,
          tentativa: tentativaConcluida,
        };
      });

      if (resultado.erro) {
        return res.status(resultado.status).json({
          message: resultado.message,
        });
      }

      if (!resultado.concluida) {
        return res.status(200).json({
          message: "Resposta corrigida. Ainda existem respostas aguardando avaliação.",
          resposta: resultado.resposta,
          respostasPendentes: resultado.respostasPendentes,
        });
      }

      return res.status(200).json({
        message: "Correção concluída. A atividade foi finalizada.",
        resposta: resultado.resposta,
        tentativa: resultado.tentativa,
      });
    } catch (error) {
      console.error("Erro ao corrigir resposta:", error);

      return res.status(500).json({
        message: "Não foi possível corrigir a resposta.",
      });
    }
  }
);

// POST /api/atividades/:atividadeId/alunos/:alunoId/liberacoes
// Professor autoriza uma nova tentativa para um aluno específico.
router.post(
  "/atividades/:atividadeId/alunos/:alunoId/liberacoes",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;
      const atividadeId = String(
        req.params.atividadeId ?? ""
      ).trim();
      const alunoId = String(
        req.params.alunoId ?? ""
      ).trim();

      const { motivo } = req.body ?? {};

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (
        motivo !== undefined &&
        motivo !== null &&
        (
          typeof motivo !== "string" ||
          motivo.length > 500
        )
      ) {
        return res.status(400).json({
          message: "O motivo deve ter no máximo 500 caracteres.",
        });
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const atividade = await tx.atividade.findFirst({
          where: {
            id: atividadeId,
            turma: {
              professorId,
            },
          },
          select: {
            id: true,
            publicada: true,
            turma: {
              select: {
                alunos: {
                  where: {
                    alunoId,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        if (!atividade) {
          return {
            erro: true as const,
            status: 404,
            message: "Atividade não encontrada ou você não tem acesso a ela.",
          };
        }

        if (!atividade.publicada) {
          return {
            erro: true as const,
            status: 409,
            message: "A atividade ainda não foi publicada.",
          };
        }

        if (atividade.turma.alunos.length === 0) {
          return {
            erro: true as const,
            status: 404,
            message: "O aluno não está matriculado nesta turma.",
          };
        }

        const ultimaTentativa = await tx.tentativa.findFirst({
          where: {
            atividadeId,
            alunoId,
          },
          orderBy: {
            numero: "desc",
          },
          select: {
            id: true,
            numero: true,
            status: true,
          },
        });

        if (!ultimaTentativa) {
          return {
            erro: true as const,
            status: 409,
            message: "O aluno ainda não iniciou a primeira tentativa.",
          };
        }

        if (ultimaTentativa.status !== "CONCLUIDA") {
          return {
            erro: true as const,
            status: 409,
            message: "O aluno precisa concluir a tentativa atual antes de receber outra autorização.",
          };
        }

        const liberacaoPendente =
          await tx.liberacaoTentativa.findFirst({
            where: {
              atividadeId,
              alunoId,
              utilizadaEm: null,
            },
            select: {
              id: true,
            },
          });

        if (liberacaoPendente) {
          return {
            erro: true as const,
            status: 409,
            message: "Já existe uma autorização aguardando utilização.",
          };
        }

        const liberacao = await tx.liberacaoTentativa.create({
          data: {
            atividadeId,
            alunoId,
            professorId,
            motivo:
              typeof motivo === "string" && motivo.trim()
                ? motivo.trim()
                : null,
          },
          select: {
            id: true,
            atividadeId: true,
            alunoId: true,
            professorId: true,
            motivo: true,
            criadaEm: true,
            utilizadaEm: true,
          },
        });

        return {
          erro: false as const,
          liberacao,
          numeroProximaTentativa: ultimaTentativa.numero + 1,
        };
      });

      if (resultado.erro) {
        return res.status(resultado.status).json({
          message: resultado.message,
        });
      }

      return res.status(201).json({
        message: "Nova tentativa autorizada com sucesso!",
        liberacao: resultado.liberacao,
        numeroProximaTentativa: resultado.numeroProximaTentativa,
      });
    } catch (error) {
      console.error("Erro ao liberar tentativa:", error);

      return res.status(500).json({
        message: "Não foi possível liberar uma nova tentativa.",
      });
    }
  }
);

export default router;
