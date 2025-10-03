import pool from '../config/database';

export const getAllAppointments = async () => {
  const result = await pool.query('SELECT * FROM appointments');
  return result.rows;
};

export const getAppointmentById = async (id: string) => {
  const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
  return result.rows[0];
};

export const createAppointment = async (appointment: any) => {
  const { patient_id, dentist_id, appointment_date, type, notes, status } = appointment;

  // Verifica se já existe uma consulta no mesmo horário para o mesmo dentista
  const conflictResult = await pool.query(
    'SELECT id FROM appointments WHERE dentist_id = $1 AND appointment_date = $2',
    [dentist_id, appointment_date]
  );

  if (conflictResult.rows.length > 0) {
    throw new Error('Conflito de agendamento: O horário selecionado não está disponível.');
  }

  const result = await pool.query(
    'INSERT INTO appointments (patient_id, dentist_id, appointment_date, type, notes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [patient_id, dentist_id, appointment_date, type, notes, status]
  );
  return result.rows[0];
};

export const updateAppointment = async (id: string, appointment: any) => {
  const { patient_id, dentist_id, appointment_date, type, notes, status } = appointment;
  const result = await pool.query(
    'UPDATE appointments SET patient_id = $1, dentist_id = $2, appointment_date = $3, type = $4, notes = $5, status = $6 WHERE id = $7 RETURNING *',
    [patient_id, dentist_id, appointment_date, type, notes, status, id]
  );
  return result.rows[0];
};

export const deleteAppointment = async (id: string) => {
  const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
