import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
}

export const checkPermission = (module: string, action: 'access' | 'create' | 'edit' | 'delete' | 'view_all') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { role } = req.user;

      // Admin sempre tem acesso total
      if (role === 'admin') {
        return next();
      }

      // Verificar permissão no banco
      const result = await pool.query(
        'SELECT * FROM role_permissions WHERE role = $1 AND module = $2',
        [role, module]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Permissão não encontrada' });
      }

      const permission = result.rows[0];
      let hasPermission = false;

      switch (action) {
        case 'access':
          hasPermission = permission.can_access;
          break;
        case 'create':
          hasPermission = permission.can_create;
          break;
        case 'edit':
          hasPermission = permission.can_edit;
          break;
        case 'delete':
          hasPermission = permission.can_delete;
          break;
        case 'view_all':
          hasPermission = permission.can_view_all;
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res.status(403).json({ 
          error: `Acesso negado: você não tem permissão para ${action} no módulo ${module}` 
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar se o usuário pode acessar apenas seus próprios dados
export const checkDataAccess = (module: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { role, id: userId } = req.user;

      // Admin sempre tem acesso total
      if (role === 'admin') {
        return next();
      }

      // Verificar se tem permissão para ver todos os dados
      const result = await pool.query(
        'SELECT can_view_all FROM role_permissions WHERE role = $1 AND module = $2',
        [role, module]
      );

      if (result.rows.length === 0 || !result.rows[0].can_view_all) {
        // Se não pode ver todos, adicionar filtro para ver apenas seus dados
        req.query.user_filter = userId.toString();
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar acesso aos dados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};