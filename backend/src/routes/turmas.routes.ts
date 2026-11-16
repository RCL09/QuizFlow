
import { Router } from "express";
import { randomBytes } from "node:crypto";
import { prisma } from "../prisma.ts";
import {
  autenticar,
  permitirRoles,
} from "../middlewares/auth.middleware.ts";

const router = Router();

// Gera um código aleatório de 8 caracteres e verifica se já existe.
async function gerarCodigoTurma(): Promise<string> {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = randomBytes(4).toString("hex").toUpperCase();

    const turmaExistente = await prisma.turma.findUnique({
      where: { codigo },
      select: { id: true },
    });

    if (!turmaExistente) {
      return codigo;
    }
  }

  throw new Error("Não foi possível gerar um código para a turma.");
}

// POST /api/turmas
// Criação de turma: somente professores.
router.post(
  "/",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;
      const { nome, descricao } = req.body ?? {};

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (typeof nome !== "string" || !nome.trim()) {
        return res.status(400).json({
          message: "Informe o nome da turma.",
        });
      }

      if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== "string"
      ) {
        return res.status(400).json({
          message: "A descrição da turma é inválida.",
        });
      }

      const codigo = await gerarCodigoTurma();

      const turma = await prisma.turma.create({
        data: {
          nome: nome.trim(),
          descricao:
            typeof descricao === "string" && descricao.trim()
              ? descricao.trim()
              : null,
          codigo,
          professorId,
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          codigo: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        message: "Turma criada com sucesso!",
        turma,
      });
    } catch (error) {
      console.error("Erro ao criar turma:", error);

      return res.status(500).json({
        message: "Não foi possível criar a turma.",
      });
    }
  }
);

// GET /api/turmas
// Lista as turmas conforme o perfil do usuário autenticado.
router.get("/", autenticar, async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    // Professor consulta somente as turmas que criou.
    if (role === "PROFESSOR") {
      const turmas = await prisma.turma.findMany({
        where: {
          professorId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          codigo: true,
          createdAt: true,
          _count: {
            select: {
              alunos: true,
              atividades: true,
            },
          },
        },
      });

      return res.status(200).json({ turmas });
    }

    // Aluno consulta somente as turmas em que está matriculado.
    if (role === "ALUNO") {
      const turmas = await prisma.turma.findMany({
        where: {
          alunos: {
            some: {
              alunoId: userId,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          createdAt: true,
          professor: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              atividades: true,
            },
          },
        },
      });

      return res.status(200).json({ turmas });
    }

    return res.status(403).json({
      message: "Perfil sem permissão para consultar turmas.",
    });
  } catch (error) {
    console.error("Erro ao consultar turmas:", error);

    return res.status(500).json({
      message: "Não foi possível consultar as turmas.",
    });
  }
});

// POST /api/turmas/entrar
// Aluno entra em uma turma usando o código de acesso.
router.post(
  "/entrar",
  autenticar,
  permitirRoles("ALUNO"),
  async (req, res) => {
    try {
      const alunoId = req.user?.id;
      const { codigo } = req.body ?? {};

      if (!alunoId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (typeof codigo !== "string" || !codigo.trim()) {
        return res.status(400).json({
          message: "Informe o código da turma.",
        });
      }

      const codigoNormalizado = codigo.trim().toUpperCase();

      const turma = await prisma.turma.findUnique({
        where: {
          codigo: codigoNormalizado,
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          professor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!turma) {
        return res.status(404).json({
          message: "Nenhuma turma encontrada com esse código.",
        });
      }

      const vinculoExistente = await prisma.turmaAluno.findUnique({
        where: {
          alunoId_turmaId: {
            alunoId,
            turmaId: turma.id,
          },
        },
      });

      if (vinculoExistente) {
        return res.status(409).json({
          message: "Você já participa dessa turma.",
        });
      }

      await prisma.turmaAluno.create({
        data: {
          alunoId,
          turmaId: turma.id,
        },
      });

      return res.status(201).json({
        message: "Você entrou na turma com sucesso!",
        turma,
      });
    } catch (error) {
      console.error("Erro ao entrar na turma:", error);

      return res.status(500).json({
        message: "Não foi possível entrar na turma.",
      });
    }
  }
);

// GET /api/turmas/:turmaId/alunos
// Consulta os alunos de uma turma. Somente o professor responsável.

router.get(
  "/:turmaId/alunos",
  autenticar,
  permitirRoles("PROFESSOR"),
  async (req, res) => {
    try {
      const professorId = req.user?.id;

      // Garante que o parâmetro seja tratado como string.
      const turmaId = String(req.params.turmaId ?? "").trim();

      if (!professorId) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      if (!turmaId) {
        return res.status(400).json({
          message: "Identificador da turma não informado.",
        });
      }

      // Verifica se a turma pertence ao professor autenticado.
      const turma = await prisma.turma.findFirst({
        where: {
          id: turmaId,
          professorId,
        },
        select: {
          id: true,
          nome: true,
          codigo: true,
        },
      });

      if (!turma) {
        return res.status(404).json({
          message: "Turma não encontrada ou você não tem acesso a ela.",
        });
      }

      // Busca os vínculos e também os dados dos alunos relacionados.
      const vinculos = await prisma.turmaAluno.findMany({
        where: {
          turmaId: turmaId,
        },
        orderBy: {
          entrouEm: "asc",
        },
        select: {
          entrouEm: true,
          aluno: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Organiza os dados dos alunos para a resposta.
      const alunos = vinculos.map((vinculo) => ({
        id: vinculo.aluno.id,
        name: vinculo.aluno.name,
        email: vinculo.aluno.email,
        entrouEm: vinculo.entrouEm,
      }));

      return res.status(200).json({
        turma,
        totalAlunos: alunos.length,
        alunos,
      });
    } catch (error) {
      console.error("Erro ao consultar alunos da turma:", error);

      return res.status(500).json({
        message: "Não foi possível consultar os alunos da turma.",
      });
    }
  }
);


export default router;