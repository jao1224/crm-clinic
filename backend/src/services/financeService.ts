import pool from '../config/database';

export const getAllFinances = async () => {
  const result = await pool.query('SELECT * FROM finances');
  return result.rows;
};

export const getFinanceById = async (id: string) => {
  const result = await pool.query('SELECT * FROM finances WHERE id = $1', [id]);
  return result.rows[0];
};

export const createFinance = async (finance: any) => {
  const { patient_id, description, amount, date, type } = finance;
  const result = await pool.query(
    'INSERT INTO finances (patient_id, description, amount, date, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [patient_id, description, amount, date, type]
  );
  return result.rows[0];
};

export const updateFinance = async (id: string, finance: any) => {
  const { patient_id, description, amount, date, type } = finance;
  const result = await pool.query(
    'UPDATE finances SET patient_id = $1, description = $2, amount = $3, date = $4, type = $5 WHERE id = $6 RETURNING *',
    [patient_id, description, amount, date, type, id]
  );
  return result.rows[0];
};

export const deleteFinance = async (id: string) => {
  const result = await pool.query('DELETE FROM finances WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
