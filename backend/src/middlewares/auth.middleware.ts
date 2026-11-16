
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type UserRole = "ALUNO" | "PROFESSOR";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

// Verifica se o usuário está autenticado
export function autenticar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token não informado."
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Formato de token inválido."
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "Configuração de autenticação ausente."
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      (decoded.role !== "ALUNO" &&
        decoded.role !== "PROFESSOR")
    ) {
      return res.status(401).json({
        message: "Token inválido."
      });
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado."
    });
  }
}

// Verifica se o usuário possui a permissão necessária
export function permitirRoles(...roles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Você não tem permissão para realizar esta ação."
      });
    }

    next();
  };
}
