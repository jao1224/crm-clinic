import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estender a interface Request para incluir dados do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        username: string;
        role: string;
      };
    }
  }
}

export const extractUserFromToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Tentar obter o token do cookie ou header
    const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dental-clinic-secret-key-2024') as any;
        req.user = {
          id: decoded.id,
          name: decoded.name,
          username: decoded.username,
          role: decoded.role
        };
        console.log('👤 Usuário extraído do token:', req.user.name, '(', req.user.role, ')');
      } catch (jwtError) {
        // Token inválido, mas não bloquear a requisição
        console.log('⚠️ Token inválido ou expirado');
      }
    } else {
      console.log('⚠️ Nenhum token encontrado');
    }
    
    // Se não há usuário, usar um usuário padrão para auditoria
    if (!req.user) {
      req.user = {
        id: 1,
        name: 'Sistema',
        username: 'system',
        role: 'admin'
      };
      console.log('🤖 Usando usuário padrão do sistema');
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    next();
  }
};