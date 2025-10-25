import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, username, name, role FROM users');
  return result.rows;
};

export const login = async (credentials: any) => {
  const { username, password } = credentials;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    const { password, ...userWithoutPassword } = user;
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'dental-clinic-secret-key-2024',
      { expiresIn: '1h' }
    );
    return { token, user: userWithoutPassword };
  }
  return null;
};

export const getUserById = async (id: string) => {
  const result = await pool.query('SELECT id, username, name, role FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (user: any) => {
  const { username, password, name, role } = user;
  
  // Verificar se o usuário já existe
  const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (existingUser.rows.length > 0) {
    const error = new Error('Nome de usuário já existe');
    (error as any).code = '23505';
    (error as any).constraint = 'users_username_key';
    throw error;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
    [username, hashedPassword, name, role]
  );
  return result.rows[0];
};

export const updateUser = async (id: string, user: any) => {
  const { username, name, role } = user;
  const result = await pool.query(
    'UPDATE users SET username = $1, name = $2, role = $3 WHERE id = $4 RETURNING id, username, name, role',
    [username, name, role, id]
  );
  return result.rows[0];
};

export const deleteUser = async (id: string) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, name, role', [id]);
  return result.rows[0];
};

export const seedAdminUser = async () => {
  const username = 'admin';
  const password = 'admin';
  const name = 'Admin User';
  const role = 'admin';

  // Verifica se o usuário já existe
  const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (existingUser.rows.length > 0) {
    throw new Error('Admin user already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
    [username, hashedPassword, name, role]
  );
  return result.rows[0];
};
