import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.ts";
import { prisma } from "./prisma.ts";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// CORS aberto para facilitar o desenvolvimento local com Expo/Web.
// Restrinja as origens antes de publicar o backend em produção.
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    name: "QuizFlow API",
    status: "online",
    health: "/api/health",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ api: "online", database: "connected" });
  } catch (error) {
    console.error("Falha ao verificar o banco:", error);
    res.status(503).json({ api: "online", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`QuizFlow API rodando em http://localhost:${PORT}`);
  console.log(`Verificação: http://localhost:${PORT}/api/health`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} recebido. Encerrando a API...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
