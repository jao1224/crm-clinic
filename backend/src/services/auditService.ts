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

export const restoreItem = async (logId: number, userId: number, userName: string) => {
  try {
    // Buscar o log de auditoria
    const logResult = await pool.query(
      'SELECT * FROM audit_logs WHERE id = $1 AND action = $2',
      [logId, 'DELETE']
    );
    
    if (logResult.rows.length === 0) {
      return { success: false, message: 'Log de exclusão não encontrado' };
    }
    
    const log = logResult.rows[0];
    const { entity_type, entity_id, entity_name, details } = log;
    
    if (!details || !details.deleted_patient && !details.deleted_user) {
      return { success: false, message: 'Dados para restauração não disponíveis' };
    }
    
    let restoredItem;
    
    // Restaurar baseado no tipo de entidade
    switch (entity_type) {
      case 'patients':
        const patientData = details.deleted_patient;
        if (patientData) {
          restoredItem = await pool.query(
            `INSERT INTO patients (name, email, phone, date_of_birth, address, medical_history, cpf) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [patientData.name, patientData.email, patientData.phone, patientData.date_of_birth, 
             patientData.address, patientData.medical_history, patientData.cpf]
          );
        }
        break;
        
      case 'users':
        const userData = details.deleted_user;
        if (userData) {
          restoredItem = await pool.query(
            `INSERT INTO users (username, password, name, role) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [userData.username, userData.password, userData.name, userData.role]
          );
        }
        break;
        
      default:
        return { success: false, message: 'Tipo de entidade não suportado para restauração' };
    }
    
    // Criar novo log de auditoria para a restauração
    await createAuditLog({
      user_id: userId,
      user_name: userName,
      action: 'RESTORE',
      entity_type,
      entity_id: restoredItem?.rows[0]?.id || entity_id,
      entity_name,
      details: { restored_from_log_id: logId },
      ip_address: undefined,
      user_agent: undefined
    });
    
    return { 
      success: true, 
      message: 'Item restaurado com sucesso',
      data: restoredItem?.rows[0]
    };
    
  } catch (error) {
    console.error('Erro ao restaurar item:', error);
    return { success: false, message: 'Erro interno ao restaurar item' };
  }
};