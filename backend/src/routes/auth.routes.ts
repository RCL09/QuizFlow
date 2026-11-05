import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.ts";

const router = Router();

type FrontRole = "aluno" | "professor";

type TokenUser = {
  id: string;
  role: string;
};

function createToken(user: TokenUser): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET ausente ou muito curta. Configure uma chave com pelo menos 32 caracteres no backend/.env.");
  }

  return jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: "8h" }
  );
}

function formatUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "ALUNO" ? "aluno" : "professor",
    schoolName: user.schoolName,
    createdAt: user.createdAt,
  };
}

// Cadastro público de aluno ou professor. Aluno não precisa de turma no cadastro.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, schoolName } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Informe o nome completo." });
      return;
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      res.status(400).json({ message: "Informe um e-mail válido." });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    if (role !== "aluno" && role !== "professor") {
      res.status(400).json({ message: "Selecione aluno ou professor." });
      return;
    }

    if (
      role === "professor" &&
      (typeof schoolName !== "string" || !schoolName.trim())
    ) {
      res.status(400).json({ message: "Informe a instituição de ensino do professor." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      res.status(409).json({ message: "Este e-mail já está cadastrado." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: role === "aluno" ? "ALUNO" : "PROFESSOR",
        // schoolName só é armazenado para professor.
        schoolName: role === "professor" ? schoolName.trim() : null,
      },
    });

    const token = createToken(user);

    res.status(201).json({
      message: "Cadastro realizado com sucesso! Agora você já pode entrar.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    const knownError = error as { code?: string };

    if (knownError.code === "P2002") {
      res.status(409).json({ message: "Este e-mail já está cadastrado." });
      return;
    }

    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({
      message: "Não foi possível realizar o cadastro. Verifique o servidor e o banco de dados.",
    });
  }
});

// Login exige que o perfil selecionado corresponda ao perfil salvo no banco.
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Informe e-mail e senha." });
      return;
    }

    if (role !== "aluno" && role !== "professor") {
      res.status(400).json({ message: "Selecione aluno ou professor." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ message: "E-mail ou senha incorretos." });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      res.status(401).json({ message: "E-mail ou senha incorretos." });
      return;
    }

    const requestedRole: FrontRole = role;
    const storedRole: FrontRole = user.role === "ALUNO" ? "aluno" : "professor";

    if (requestedRole !== storedRole) {
      res.status(403).json({ message: "Esta conta não pertence ao perfil selecionado." });
      return;
    }

    const token = createToken(user);

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    res.status(500).json({
      message: "Não foi possível realizar o login. Tente novamente.",
    });
  }
});

export default router;
