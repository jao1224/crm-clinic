import pool from '../config/database';

export interface AuditLogData {
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  entity_name?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export const createAuditLog = async (logData: AuditLogData) => {
  try {
    const {
      user_id,
      user_name,
      action,
      entity_type,
      entity_id,
      entity_name,
      details,
      ip_address,
      user_agent
    } = logData;

    const result = await pool.query(
      `INSERT INTO audit_logs 
       (user_id, user_name, action, entity_type, entity_id, entity_name, details, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [user_id, user_name, action, entity_type, entity_id, entity_name, JSON.stringify(details), ip_address, user_agent]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    throw error;
  }
};

export const getAllAuditLogs = async (limit = 100, offset = 0) => {
  try {
    const result = await pool.query(
      `SELECT * FROM audit_logs 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    throw error;
  }
};

export const getAuditLogsByUser = async (userId: number, limit = 50) => {
  try {
    const result = await pool.query(
      `SELECT * FROM audit_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar logs por usuário:', error);
    throw error;
  }
};

export const getAuditLogsByEntity = async (entityType: string, entityId: number) => {
  try {
    const result = await pool.query(
      `SELECT * FROM audit_logs 
       WHERE entity_type = $1 AND entity_id = $2 
       ORDER BY created_at DESC`,
      [entityType, entityId]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar logs por entidade:', error);
    throw error;
  }
};

export const getAuditLogsByDateRange = async (startDate: string, endDate: string) => {
  try {
    const result = await pool.query(
      `SELECT * FROM audit_logs 
       WHERE created_at >= $1 AND created_at <= $2 
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );

    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar logs por período:', error);
    throw error;
  }
};