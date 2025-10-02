import pool from '../config/database';

export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, username, name, role FROM users');
  return result.rows;
};

export const login = async (credentials: any) => {
  const { username, password } = credentials;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (user && user.password === password) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const getUserById = async (id: string) => {
  const result = await pool.query('SELECT id, username, name, role FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (user: any) => {
  const { username, password, name, role } = user;
  const result = await pool.query(
    'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
    [username, password, name, role]
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
