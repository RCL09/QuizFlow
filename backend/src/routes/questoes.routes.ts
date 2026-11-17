
import { Router } from "express";
import { prisma } from "../prisma.ts";
import {
  autenticar,
  permitirRoles,
} from "../middlewares/auth.middleware.ts";

const router = Router();

const TIPOS_QUESTAO = [
  "MULTIPLA_ESCOLHA",
  "VERDADEIRO_FALSO",
  "RESPOSTA_TEXTO",
  "ASSOCIACAO",
  "ORDENACAO",
] as const;

type TipoQuestao = (typeof TIPOS_QUESTAO)[number];

type ItemQuestao = {
  id: string;
  texto: string;
};

function ehObjeto(valor: unknown): valor is Record<string, any> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function validarItens(valor: unknown): valor is ItemQuestao[] {
  if (!Array.isArray(valor) || valor.length < 2) {
    return false;
  }

  if (
    !valor.every(
      (item) =>
        ehObjeto(item) &&
        typeof item.id === "string" &&
        item.id.trim().length > 0 &&
        typeof item.texto === "string" &&
        item.texto.trim().length > 0
    )
  ) {
    return false;
  }

  const ids = valor.map((item) => item.id);

  return new Set(ids).size === ids.length;
}

// Valida os dados conforme o tipo de minijogo.
function validarQuestao(dados: any): string | null {
  const {
    enunciado,
    tipo,
    configuracao,
    respostaCorreta,
    modoCorrecaoTexto,
  } = dados;

  if (
    typeof enunciado !== "string" ||
    !enunciado.trim()
  ) {
    return "Informe o enunciado da questão.";
  }

  if (!TIPOS_QUESTAO.includes(tipo)) {
    return "Tipo de questão inválido.";
  }

  if (!ehObjeto(configuracao)) {
    return "A configuração da questão deve ser um objeto JSON.";
  }

  if (tipo === "MULTIPLA_ESCOLHA") {
    const opcoes = configuracao.opcoes;

    if (
      !Array.isArray(opcoes) ||
      opcoes.length < 2 ||
      !opcoes.every(
        (opcao) =>
          ehObjeto(opcao) &&
          typeof opcao.id === "string" &&
          opcao.id.trim() !== "" &&
          typeof opcao.texto === "string" &&
          opcao.texto.trim() !== ""
      )
    ) {
      return "Informe pelo menos duas opções válidas.";
    }

    const ids = opcoes.map((opcao) => opcao.id);

    if (new Set(ids).size !== ids.length) {
      return "As opções não podem possuir IDs repetidos.";
    }

    if (
      !ehObjeto(respostaCorreta) ||
      typeof respostaCorreta.opcaoId !== "string" ||
      !ids.includes(respostaCorreta.opcaoId)
    ) {
      return "Informe uma das opções como resposta correta.";
    }
  }

  if (tipo === "VERDADEIRO_FALSO") {
    if (
      !ehObjeto(respostaCorreta) ||
      typeof respostaCorreta.valor !== "boolean"
    ) {
      return "A resposta correta deve ser true ou false.";
    }
  }

  if (tipo === "RESPOSTA_TEXTO") {
    if (
      modoCorrecaoTexto !== "AUTOMATICA" &&
      modoCorrecaoTexto !== "MANUAL"
    ) {
      return "Selecione a forma de correção da resposta textual.";
    }

    if (modoCorrecaoTexto === "AUTOMATICA") {
      const aceitas = respostaCorreta?.aceitas;

      if (
        !ehObjeto(respostaCorreta) ||
        !Array.isArray(aceitas) ||
        aceitas.length === 0 ||
        !aceitas.every(
          (resposta) =>
            typeof resposta === "string" &&
            resposta.trim().length > 0
        )
      ) {
        return "Informe pelo menos uma resposta textual aceita.";
      }
    }

    if (
      modoCorrecaoTexto === "MANUAL" &&
      respostaCorreta !== undefined &&
      respostaCorreta !== null
    ) {
      return "Questões textuais manuais não devem possuir resposta correta cadastrada.";
    }
  } else {
    if (
      modoCorrecaoTexto !== undefined &&
      modoCorrecaoTexto !== null
    ) {
      return "A forma de correção textual só pode ser usada em questões de texto.";
    }
  }

  if (tipo === "ASSOCIACAO") {
    const esquerda = configuracao.itensEsquerda;
    const direita = configuracao.itensDireita;
    const associacoes = respostaCorreta?.associacoes;

    if (
      !validarItens(esquerda) ||
      !validarItens(direita)
    ) {
      return "A associação precisa de pelo menos dois itens válidos em cada lado.";
    }

    if (esquerda.length !== direita.length) {
      return "Os dois lados da associação precisam possuir a mesma quantidade de itens.";
    }

    if (
      !ehObjeto(respostaCorreta) ||
      !Array.isArray(associacoes) ||
      associacoes.length !== esquerda.length
    ) {
      return "Informe todas as associações corretas.";
    }

    const idsEsquerda = associacoes.map(
      (item: any) => item.esquerdaId
    );

    const idsDireita = associacoes.map(
      (item: any) => item.direitaId
    );

    const associacoesValidas = associacoes.every(
      (item: any) =>
        ehObjeto(item) &&
        typeof item.esquerdaId === "string" &&
        typeof item.direitaId === "string" &&
        esquerda.some((e) => e.id === item.esquerdaId) &&
        direita.some((d) => d.id === item.direitaId)
    );

    if (
      !associacoesValidas ||
      new Set(idsEsquerda).size !== esquerda.length ||
      new Set(idsDireita).size !== direita.length
    ) {
      return "Cada item deve aparecer exatamente uma vez nas associações corretas.";
    }
  }

  if (tipo === "ORDENACAO") {
    const itens = configuracao.itens;
    const ordem = respostaCorreta?.ordem;

    if (!validarItens(itens)) {
      return "A ordenação precisa de pelo menos dois itens válidos.";
    }

    if (
      !ehObjeto(respostaCorreta) ||
      !Array.isArray(ordem) ||
      ordem.length !== itens.length ||
      !ordem.every((id: any) => typeof id === "string")
    ) {
      return "Informe a sequência correta dos itens.";
    }

    const idsItens = itens.map((item) => item.id);

    if (
      new Set(ordem).size !== ordem.length ||
      !idsItens.every((id) => ordem.includes(id))
    ) {
      return "A sequência correta deve conter todos os IDs, sem repetições.";
    }
  }

  return null;
}

// POST /api/atividades/:atividadeId/questoes
// Adiciona uma questão em uma atividade ainda não publicada.
router.post(
  "/atividades/:atividadeId/questoes",
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

      const {
        enunciado,
        tipo,
        configuracao,
        respostaCorreta,
        modoCorrecaoTexto,
        explicacao,
        valor,
        ordem,
      } = req.body ?? {};

      const erro = validarQuestao(req.body ?? {});

      if (erro) {
        return res.status(400).json({
          message: erro,
        });
      }

      if (
        valor !== undefined &&
        (
          typeof valor !== "number" ||
          !Number.isFinite(valor) ||
          valor <= 0
        )
      ) {
        return res.status(400).json({
          message: "O valor da questão deve ser maior que zero.",
        });
      }

      if (
        ordem !== undefined &&
        (!Number.isInteger(ordem) || ordem <= 0)
      ) {
        return res.status(400).json({
          message: "A ordem deve ser um número inteiro positivo.",
        });
      }

      if (
        explicacao !== undefined &&
        explicacao !== null &&
        typeof explicacao !== "string"
      ) {
        return res.status(400).json({
          message: "A explicação deve ser um texto válido.",
        });
      }

      // Confirma que a atividade pertence ao professor.
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
          message: "Não é possível adicionar questões a uma atividade publicada.",
        });
      }

      // Define automaticamente a próxima posição.
      const ultimaOrdem = await prisma.questao.aggregate({
        where: {
          atividadeId,
        },
        _max: {
          ordem: true,
        },
      });

      const ordemFinal =
        ordem ?? (ultimaOrdem._max.ordem ?? 0) + 1;

      // Questão textual manual não possui resposta correta pré-cadastrada.
      const dadosCriacao: any = {
        enunciado: enunciado.trim(),
        tipo: tipo as TipoQuestao,
        configuracao,
        modoCorrecaoTexto:
          tipo === "RESPOSTA_TEXTO"
            ? modoCorrecaoTexto
            : null,
        explicacao: explicacao?.trim() || null,
        valor: valor ?? 1,
        ordem: ordemFinal,
        atividadeId,
      };

      if (
        !(tipo === "RESPOSTA_TEXTO" &&
          modoCorrecaoTexto === "MANUAL")
      ) {
        dadosCriacao.respostaCorreta = respostaCorreta;
      }

      const questao = await prisma.questao.create({
        data: dadosCriacao,
      });

      return res.status(201).json({
        message: "Questão adicionada com sucesso!",
        questao,
      });
    } catch (error) {
      const knownError = error as { code?: string };

      if (knownError.code === "P2002") {
        return res.status(409).json({
          message: "Já existe uma questão com essa ordem na atividade.",
        });
      }

      console.error("Erro ao adicionar questão:", error);

      return res.status(500).json({
        message: "Não foi possível adicionar a questão.",
      });
    }
  }
);

// PATCH /api/atividades/:atividadeId/publicar
// Publica uma atividade que já possui pelo menos uma questão.
router.patch(
  "/atividades/:atividadeId/publicar",
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
          message: "Esta atividade já está publicada.",
        });
      }

      const totalQuestoes = await prisma.questao.count({
        where: {
          atividadeId,
        },
      });

      if (totalQuestoes === 0) {
        return res.status(400).json({
          message: "Adicione pelo menos uma questão antes de publicar.",
        });
      }

      const atividadePublicada = await prisma.atividade.update({
        where: {
          id: atividadeId,
        },
        data: {
          publicada: true,
        },
        select: {
          id: true,
          titulo: true,
          mostrarResultado: true,
          modoFeedback: true,
          publicada: true,
        },
      });

      return res.status(200).json({
        message: "Atividade publicada com sucesso!",
        atividade: atividadePublicada,
      });
    } catch (error) {
      console.error("Erro ao publicar atividade:", error);

      return res.status(500).json({
        message: "Não foi possível publicar a atividade.",
      });
    }
  }
);

export default router;