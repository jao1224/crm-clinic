import pool from '../config/database';

const parseDentist = (dentist: any) => {
  if (dentist && typeof dentist.specializations === 'string') {
    dentist.specializations = dentist.specializations.replace(/[{}]/g, '').split(',');
  }
  return dentist;
};

export const getAllDentists = async () => {
  const result = await pool.query('SELECT * FROM dentists');
  return result.rows.map(parseDentist);
};

export const getDentistById = async (id: string) => {
  const result = await pool.query('SELECT * FROM dentists WHERE id = $1', [id]);
  return parseDentist(result.rows[0]);
};

export const createDentist = async (dentist: any) => {
  const { name, specialty, email, phone, experience, patients, specializations } = dentist;
  const result = await pool.query(
    'INSERT INTO dentists (name, specialty, email, phone, experience, patients, specializations) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, specialty, email, phone, experience, patients, specializations]
  );
  return parseDentist(result.rows[0]);
};

export const updateDentist = async (id: string, dentist: any) => {
  const { name, specialty, email, phone, experience, patients, specializations } = dentist;
  const result = await pool.query(
    'UPDATE dentists SET name = $1, specialty = $2, email = $3, phone = $4, experience = $5, patients = $6, specializations = $7 WHERE id = $8 RETURNING *',
    [name, specialty, email, phone, experience, patients, specializations, id]
  );
  return parseDentist(result.rows[0]);
};

export const deleteDentist = async (id: string) => {
  const result = await pool.query('DELETE FROM dentists WHERE id = $1 RETURNING *', [id]);
  return parseDentist(result.rows[0]);
};

// Funções para gerenciar horários de atendimento do dentista
export const getDentistSchedules = async (dentistId: string) => {
  const result = await pool.query('SELECT * FROM dentist_schedules WHERE dentist_id = $1', [dentistId]);
  return result.rows;
};

export const createDentistSchedule = async (dentistId: string, schedule: any) => {
  const { day_of_week, start_time, end_time, slot_duration_minutes } = schedule;
  const result = await pool.query(
    'INSERT INTO dentist_schedules (dentist_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [dentistId, day_of_week, start_time, end_time, slot_duration_minutes]
  );
  return result.rows[0];
};

export const updateDentistSchedule = async (scheduleId: string, schedule: any) => {
  const { day_of_week, start_time, end_time, slot_duration_minutes } = schedule;
  const result = await pool.query(
    'UPDATE dentist_schedules SET day_of_week = $1, start_time = $2, end_time = $3, slot_duration_minutes = $4 WHERE id = $5 RETURNING *',
    [day_of_week, start_time, end_time, slot_duration_minutes, scheduleId]
  );
  return result.rows[0];
};

export const deleteDentistSchedule = async (scheduleId: string) => {
  const result = await pool.query('DELETE FROM dentist_schedules WHERE id = $1 RETURNING *', [scheduleId]);
  return result.rows[0];
};

export const getAvailableSlots = async (dentistId: string, date: string) => {
  // Lógica para calcular slots disponíveis
  // 1. Obter os horários de trabalho do dentista para o dia da semana da data fornecida.
  // 2. Obter todos os agendamentos existentes para o dentista na data fornecida.
  // 3. Gerar todos os slots possíveis com base nos horários de trabalho e duração do slot.
  // 4. Filtrar os slots que já estão ocupados por agendamentos.
  // 5. Retornar os slots disponíveis.

  const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'long' });

  const schedulesResult = await pool.query(
    'SELECT * FROM dentist_schedules WHERE dentist_id = $1 AND day_of_week = $2',
    [dentistId, dayOfWeek]
  );
  const schedules = schedulesResult.rows;

  if (schedules.length === 0) {
    return []; // Dentista não tem horário de trabalho para este dia
  }

  const appointmentsResult = await pool.query(
    'SELECT appointment_date FROM appointments WHERE dentist_id = $1 AND DATE(appointment_date) = $2',
    [dentistId, date]
  );
  const bookedSlots = appointmentsResult.rows.map(row => new Date(row.appointment_date).getTime());

  const availableSlots: Date[] = [];

  for (const schedule of schedules) {
    const start = new Date(`${date}T${schedule.start_time}`);
    const end = new Date(`${date}T${schedule.end_time}`);
    const slotDuration = schedule.slot_duration_minutes * 60 * 1000; // Converter para milissegundos

    let currentSlot = start.getTime();

    while (currentSlot + slotDuration <= end.getTime()) {
      const slotEndTime = currentSlot + slotDuration;
      // Verificar se o slot está ocupado
      const isBooked = bookedSlots.some(bookedTime => {
        const bookedStart = bookedTime;
        const bookedEnd = bookedTime + (schedule.slot_duration_minutes * 60 * 1000); // Assumindo que a duração do agendamento é a mesma do slot
        return (currentSlot < bookedEnd && slotEndTime > bookedStart);
      });

      if (!isBooked) {
        availableSlots.push(new Date(currentSlot));
      }
      currentSlot += slotDuration;
    }
  }

  return availableSlots;
};
