import { Router } from "express";
import { prisma } from "../prisma.ts";
import {
  autenticar,
  permitirRoles,
} from "../middlewares/auth.middleware.ts";

const router = Router();

function ehObjeto(valor: unknown): valor is Record<string, any> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

// Normaliza respostas textuais para comparação automática.
function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Corrige automaticamente as questões.
function corrigirResposta(
  questao: any,
  resposta: any
): {
  erro?: string;
  correta: boolean | null;
  pontosObtidos: number | null;
} {
  if (!ehObjeto(resposta)) {
    return {
      erro: "A resposta deve ser um objeto JSON.",
      correta: null,
      pontosObtidos: null,
    };
  }

  const respostaCorreta = questao.respostaCorreta;
  let correta: boolean | null = null;

  switch (questao.tipo) {
    case "MULTIPLA_ESCOLHA": {
      if (
        typeof resposta.opcaoId !== "string" ||
        !questao.configuracao.opcoes.some(
          (opcao: any) => opcao.id === resposta.opcaoId
        )
      ) {
        return {
          erro: "Selecione uma opção válida.",
          correta: null,
          pontosObtidos: null,
        };
      }

      correta = resposta.opcaoId === respostaCorreta.opcaoId;
      break;
    }

    case "VERDADEIRO_FALSO": {
      if (typeof resposta.valor !== "boolean") {
        return {
          erro: "Informe verdadeiro ou falso.",
          correta: null,
          pontosObtidos: null,
        };
      }

      correta = resposta.valor === respostaCorreta.valor;
      break;
    }

    case "RESPOSTA_TEXTO": {
      if (
        typeof resposta.texto !== "string" ||
        !resposta.texto.trim()
      ) {
        return {
          erro: "Informe uma resposta textual.",
          correta: null,
          pontosObtidos: null,
        };
      }

      if (questao.modoCorrecaoTexto === "MANUAL") {
        return {
          correta: null,
          pontosObtidos: null,
        };
      }

      const aceitas = respostaCorreta?.aceitas;

      if (!Array.isArray(aceitas) || aceitas.length === 0) {
        return {
          erro: "A questão não possui respostas automáticas configuradas.",
          correta: null,
          pontosObtidos: null,
        };
      }

      correta = aceitas.some(
        (item: string) =>
          normalizarTexto(item) === normalizarTexto(resposta.texto)
      );
      break;
    }

    case "ASSOCIACAO": {
      const associacoes = resposta.associacoes;
      const corretas = respostaCorreta.associacoes;

      if (
        !Array.isArray(associacoes) ||
        associacoes.length !== corretas.length
      ) {
        return {
          erro: "Envie todas as associações.",
          correta: null,
          pontosObtidos: null,
        };
      }

      const paresValidos = associacoes.every((item: any) =>
        ehObjeto(item) &&
        typeof item.esquerdaId === "string" &&
        typeof item.direitaId === "string"
      );

      if (!paresValidos) {
        return {
          erro: "Formato de associação inválido.",
          correta: null,
          pontosObtidos: null,
        };
      }

      const idsEsquerda = associacoes.map(
        (item: any) => item.esquerdaId
      );
      const idsDireita = associacoes.map(
        (item: any) => item.direitaId
      );

      const idsEsquerdaValidos =
        questao.configuracao.itensEsquerda.map((item: any) => item.id);
      const idsDireitaValidos =
        questao.configuracao.itensDireita.map((item: any) => item.id);

      if (
        new Set(idsEsquerda).size !== associacoes.length ||
        new Set(idsDireita).size !== associacoes.length ||
        !idsEsquerda.every((id: string) => idsEsquerdaValidos.includes(id)) ||
        !idsDireita.every((id: string) => idsDireitaValidos.includes(id))
      ) {
        return {
          erro: "Existem itens inválidos ou repetidos nas associações.",
          correta: null,
          pontosObtidos: null,
        };
      }

      const paresRecebidos = associacoes.map(
        (item: any) => `${item.esquerdaId}:${item.direitaId}`
      );

      const paresCorretos = corretas.map(
        (item: any) => `${item.esquerdaId}:${item.direitaId}`
      );

      correta =
        paresRecebidos.length === paresCorretos.length &&
        paresRecebidos.every((par: string) => paresCorretos.includes(par));
      break;
    }

    case "ORDENACAO": {
      const ordem = resposta.ordem;
      const ordemCorreta = respostaCorreta.ordem;
      const idsValidos = questao.configuracao.itens.map(
        (item: any) => item.id
      );

      if (
        !Array.isArray(ordem) ||
        ordem.length !== idsValidos.length ||
        !ordem.every((id: any) => typeof id === "string") ||
        new Set(ordem).size !== idsValidos.length ||
        !idsValidos.every((id: string) => ordem.includes(id))
      ) {
        return {
          erro: "A sequência enviada é inválida.",
          correta: null,
          pontosObtidos: null,
        };
      }

      correta = ordem.every(
        (id: string, indice: number) => id === ordemCorreta[indice]
      );
      break;
    }

    default:
      return {
        erro: "Tipo de questão não suportado.",
        correta: null,
        pontosObtidos: null,
      };
  }

  return {
    correta,
    pontosObtidos: correta ? questao.valor : 0,
  };
}

// POST /api/atividades/:atividadeId/tentativas
// Inicia a primeira tentativa ou retoma uma tentativa em andamento.
router.post(
  "/atividades/:atividadeId/tentativas",
  autenticar,
  permitirRoles("ALUNO"),
  async (req, res) => {
    try {
      const alunoId = req.user?.id;
      const atividadeId = String(req.params.atividadeId ?? "").trim();

      if (!alunoId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const resultado = await prisma.$transaction(async (tx) => {
          const atividade = await tx.atividade.findUnique({
              where: { id: atividadeId },
              include: {
                  turma: {
                      select: {
                          professorId: true,
                          alunos: {
                              where: { alunoId },
                              select: { id: true },
                          },
                      },
                  },
                  questoes: {
                      select: {
                          id: true,
                      },
                  },
              },
          });

        if (!atividade || !atividade.publicada) {
          return {
            tipo: "erro",
            status: 404,
            message: "Atividade não encontrada ou não publicada.",
          };
        }

        if (atividade.turma.alunos.length === 0) {
          return {
            tipo: "erro",
            status: 403,
            message: "Você não participa desta turma.",
          };
        }

        if (atividade.questoes.length === 0) {
          return {
            tipo: "erro",
            status: 400,
            message: "Esta atividade ainda não possui questões.",
          };
        }

        const emAndamento = await tx.tentativa.findFirst({
          where: {
            alunoId,
            atividadeId,
            status: "EM_ANDAMENTO",
          },
        });

        if (emAndamento) {
          return {
            tipo: "sucesso",
            status: 200,
            tentativa: emAndamento,
            retomada: true,
          };
        }

        const aguardandoCorrecao = await tx.tentativa.findFirst({
          where: {
            alunoId,
            atividadeId,
            status: "AGUARDANDO_CORRECAO",
          },
        });

        if (aguardandoCorrecao) {
          return {
            tipo: "erro",
            status: 409,
            message: "Sua atividade está aguardando correção do professor.",
          };
        }

        const totalAnterior = await tx.tentativa.count({
          where: {
            alunoId,
            atividadeId,
          },
        });

        let liberacaoId: string | null = null;

        if (totalAnterior > 0) {
          const liberacao = await tx.liberacaoTentativa.findFirst({
            where: {
              atividadeId,
              alunoId,
              professorId: atividade.turma.professorId,
              utilizadaEm: null,
            },
            orderBy: {
              criadaEm: "asc",
            },
          });

          if (!liberacao) {
            return {
              tipo: "erro",
              status: 403,
              message: "Você já realizou esta atividade. Solicite ao professor uma nova tentativa.",
            };
          }

          const consumo = await tx.liberacaoTentativa.updateMany({
            where: {
              id: liberacao.id,
              utilizadaEm: null,
            },
            data: {
              utilizadaEm: new Date(),
            },
          });

          if (consumo.count !== 1) {
            return {
              tipo: "erro",
              status: 409,
              message: "Esta autorização já foi utilizada.",
            };
          }

          liberacaoId = liberacao.id;
        }

        const tentativa = await tx.tentativa.create({
          data: {
            alunoId,
            atividadeId,
            numero: totalAnterior + 1,
            status: "EM_ANDAMENTO",
            liberacaoId,
          },
        });

        return {
          tipo: "sucesso",
          status: 201,
          tentativa,
          retomada: false,
        };
      });

      if (resultado.tipo === "erro") {
        return res.status(resultado.status).json({
          message: resultado.message,
        });
      }

      return res.status(resultado.status).json({
        message: resultado.retomada
          ? "Tentativa em andamento recuperada."
          : "Atividade iniciada com sucesso!",
        tentativa: resultado.tentativa,
        retomada: resultado.retomada,
      });
    } catch (error) {
      const knownError = error as { code?: string };

      if (knownError.code === "P2002") {
        return res.status(409).json({
          message: "Já existe uma tentativa com essa numeração. Atualize a consulta e tente novamente.",
        });
      }

      console.error("Erro ao iniciar atividade:", error);

      return res.status(500).json({
        message: "Não foi possível iniciar a atividade.",
      });
    }
  }
);

// GET /api/tentativas/:tentativaId
// Consulta o progresso sem revelar respostas corretas ao aluno.
router.get(
  "/tentativas/:tentativaId",
  autenticar,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const tentativaId = String(req.params.tentativaId ?? "").trim();

      if (!userId || !role) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const tentativa = await prisma.tentativa.findUnique({
        where: { id: tentativaId },
        include: {
          atividade: {
            include: {
              turma: {
                select: {
                  professorId: true,
                  alunos: {
                    where: { alunoId: userId },
                    select: { id: true },
                  },
                },
              },
              questoes: {
                orderBy: { ordem: "asc" },
              },
            },
          },
          respostas: {
            include: {
              questao: {
                select: {
                  explicacao: true,
                },
              },
            },
            orderBy: { respondidaEm: "asc" },
          },
        },
      });

      if (!tentativa) {
        return res.status(404).json({
          message: "Tentativa não encontrada.",
        });
      }

      if (role === "ALUNO") {
        if (
          tentativa.alunoId !== userId ||
          tentativa.atividade.turma.alunos.length === 0
        ) {
          return res.status(403).json({
            message: "Você não tem acesso a esta tentativa.",
          });
        }
      } else if (role === "PROFESSOR") {
        if (tentativa.atividade.turma.professorId !== userId) {
          return res.status(403).json({
            message: "Você não tem acesso a esta tentativa.",
          });
        }
      } else {
        return res.status(403).json({
          message: "Perfil sem permissão.",
        });
      }

      const ehAluno = role === "ALUNO";

      const podeMostrarFeedback =
        !ehAluno ||
        tentativa.atividade.modoFeedback === "IMEDIATO" ||
        (
          tentativa.atividade.modoFeedback === "AO_FINALIZAR" &&
          tentativa.status === "CONCLUIDA"
        );

      const questoes = tentativa.atividade.questoes.map((questao) => {
        const resposta = tentativa.respostas.find(
          (item) => item.questaoId === questao.id
        );

        const dados: any = {
          id: questao.id,
          enunciado: questao.enunciado,
          tipo: questao.tipo,
          configuracao: questao.configuracao,
          modoCorrecaoTexto: questao.modoCorrecaoTexto,
          valor: questao.valor,
          ordem: questao.ordem,
          respostaEnviada: resposta?.resposta ?? null,
        };

        if (resposta && podeMostrarFeedback) {
          dados.feedback = {
            correta: resposta.correta,
            explicacao: resposta.questao.explicacao,
          };
        }

        if (!ehAluno) {
          dados.respostaCorreta = questao.respostaCorreta;
          dados.explicacao = questao.explicacao;
        }

        return dados;
      });

      const resultadoFinal =
        !ehAluno ||
        (
          tentativa.atividade.mostrarResultado &&
          tentativa.status === "CONCLUIDA"
        )
          ? {
              questoesAcertadas: tentativa.questoesAcertadas,
              totalQuestoes: tentativa.totalQuestoes,
              pontosObtidos: tentativa.pontosObtidos,
              pontosTotais: tentativa.pontosTotais,
              percentualNota: tentativa.percentualNota,
            }
          : null;

      return res.status(200).json({
        tentativa: {
          id: tentativa.id,
          numero: tentativa.numero,
          status: tentativa.status,
          iniciadaEm: tentativa.iniciadaEm,
          enviadaEm: tentativa.enviadaEm,
          concluidaEm: tentativa.concluidaEm,
          resultado: resultadoFinal,
        },
        atividade: {
          id: tentativa.atividade.id,
          titulo: tentativa.atividade.titulo,
          modoFeedback: tentativa.atividade.modoFeedback,
          mostrarResultado: tentativa.atividade.mostrarResultado,
        },
        questoes,
      });
    } catch (error) {
      console.error("Erro ao consultar tentativa:", error);

      return res.status(500).json({
        message: "Não foi possível consultar a tentativa.",
      });
    }
  }
);

// PUT /api/tentativas/:tentativaId/respostas/:questaoId
// Salva ou atualiza uma resposta do aluno.
router.put(
  "/tentativas/:tentativaId/respostas/:questaoId",
  autenticar,
  permitirRoles("ALUNO"),
  async (req, res) => {
    try {
      const alunoId = req.user?.id;
      const tentativaId = String(req.params.tentativaId ?? "").trim();
      const questaoId = String(req.params.questaoId ?? "").trim();
      const resposta = req.body?.resposta;

      if (!alunoId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (!ehObjeto(resposta)) {
        return res.status(400).json({
          message: "Informe a resposta no formato JSON.",
        });
      }

      const tentativa = await prisma.tentativa.findFirst({
        where: {
          id: tentativaId,
          alunoId,
          status: "EM_ANDAMENTO",
          atividade: {
            publicada: true,
            turma: {
              alunos: {
                some: { alunoId },
              },
            },
          },
        },
        select: {
          id: true,
          atividadeId: true,
          atividade: {
            select: {
              modoFeedback: true,
            },
          },
        },
      });

      if (!tentativa) {
        return res.status(404).json({
          message: "Tentativa não encontrada ou não está disponível para respostas.",
        });
      }

      const questao = await prisma.questao.findFirst({
        where: {
          id: questaoId,
          atividadeId: tentativa.atividadeId,
        },
      });

      if (!questao) {
        return res.status(404).json({
          message: "Questão não encontrada nesta atividade.",
        });
      }

      const correcao = corrigirResposta(questao, resposta);

      if (correcao.erro) {
        return res.status(400).json({
          message: correcao.erro,
        });
      }

      const respostaSalva = await prisma.resposta.upsert({
        where: {
          tentativaId_questaoId: {
            tentativaId,
            questaoId,
          },
        },
        create: {
          tentativaId,
          questaoId,
          resposta,
          correta: correcao.correta,
          pontosObtidos: correcao.pontosObtidos,
        },
        update: {
          resposta,
          correta: correcao.correta,
          pontosObtidos: correcao.pontosObtidos,
          respondidaEm: new Date(),
        },
        select: {
          id: true,
          questaoId: true,
          respondidaEm: true,
        },
      });

      const retorno: any = {
        message: "Resposta salva com sucesso!",
        resposta: respostaSalva,
      };

      if (
        tentativa.atividade.modoFeedback === "IMEDIATO" &&
        correcao.correta !== null
      ) {
        retorno.feedback = {
          correta: correcao.correta,
          explicacao: questao.explicacao,
        };
      }

      if (
        questao.tipo === "RESPOSTA_TEXTO" &&
        questao.modoCorrecaoTexto === "MANUAL"
      ) {
        retorno.message =
          "Resposta registrada. Ela será corrigida pelo professor.";
      }

      return res.status(200).json(retorno);
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);

      return res.status(500).json({
        message: "Não foi possível salvar a resposta.",
      });
    }
  }
);

// POST /api/tentativas/:tentativaId/finalizar
// Envia as respostas e inicia a correção final.
router.post(
  "/tentativas/:tentativaId/finalizar",
  autenticar,
  permitirRoles("ALUNO"),
  async (req, res) => {
    try {
      const alunoId = req.user?.id;
      const tentativaId = String(req.params.tentativaId ?? "").trim();

      if (!alunoId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const tentativa = await prisma.tentativa.findFirst({
        where: {
          id: tentativaId,
          alunoId,
          status: "EM_ANDAMENTO",
        },
        include: {
          atividade: {
            include: {
              turma: {
                select: {
                  alunos: {
                    where: { alunoId },
                    select: { id: true },
                  },
                },
              },
              questoes: true,
            },
          },
          respostas: {
            include: {
              questao: true,
            },
          },
        },
      });

      if (!tentativa || tentativa.atividade.turma.alunos.length === 0) {
        return res.status(404).json({
          message: "Tentativa não encontrada ou indisponível.",
        });
      }

      const questoes = tentativa.atividade.questoes;
      const respostas = tentativa.respostas;

      const idsRespondidos = new Set(
        respostas.map((resposta) => resposta.questaoId)
      );

      const naoRespondidas = questoes
        .filter((questao) => !idsRespondidos.has(questao.id))
        .map((questao) => ({
          id: questao.id,
          enunciado: questao.enunciado,
        }));

      if (naoRespondidas.length > 0) {
        return res.status(400).json({
          message: "Responda todas as questões antes de finalizar.",
          questoesPendentes: naoRespondidas,
        });
      }

      const aguardaCorrecaoManual = respostas.some(
        (resposta) =>
          resposta.questao.tipo === "RESPOSTA_TEXTO" &&
          resposta.questao.modoCorrecaoTexto === "MANUAL"
      );

      const agora = new Date();

      if (aguardaCorrecaoManual) {
        const atualizada = await prisma.tentativa.update({
          where: { id: tentativaId },
          data: {
            status: "AGUARDANDO_CORRECAO",
            enviadaEm: agora,
          },
          select: {
            id: true,
            numero: true,
            status: true,
            enviadaEm: true,
          },
        });

        return res.status(200).json({
          message: "Atividade enviada. Aguardando correção do professor.",
          tentativa: atualizada,
        });
      }

      const pontosTotais = questoes.reduce(
        (total, questao) => total + questao.valor,
        0
      );

      if (pontosTotais <= 0) {
        return res.status(400).json({
          message: "A atividade possui uma pontuação inválida.",
        });
      }

      const pontosObtidos = respostas.reduce(
        (total, resposta) =>
          total + (resposta.pontosObtidos ?? 0),
        0
      );

      const questoesAcertadas = respostas.filter(
        (resposta) => resposta.correta === true
      ).length;

      const percentualNota =
        (pontosObtidos / pontosTotais) * 100;

      const finalizada = await prisma.tentativa.update({
        where: { id: tentativaId },
        data: {
            status: "CONCLUIDA",
            questoesAcertadas,
            totalQuestoes: questoes.length,
            pontosObtidos,
            pontosTotais,
            percentualNota,
            enviadaEm: agora,
            concluidaEm: agora,
        },
        select: {
            id: true,
            numero: true,
            status: true,
            enviadaEm: true,
            concluidaEm: true,
        },
    });
      return res.status(200).json({
        message: "Atividade finalizada com sucesso!",
        tentativa: finalizada,
        ...(tentativa.atividade.mostrarResultado
          ? {
              resultado: {
                questoesAcertadas,
                totalQuestoes: questoes.length,
                pontosObtidos,
                pontosTotais,
                percentualNota,
              },
            }
          : {
              resultado: null,
              messageResultado: "O professor não disponibilizou a visualização do resultado.",
            }),
      });
    } catch (error) {
      console.error("Erro ao finalizar atividade:", error);

      return res.status(500).json({
        message: "Não foi possível finalizar a atividade.",
      });
    }
  }
);

export default router;