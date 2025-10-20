import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const authResult = await userService.login(req.body);
    if (authResult) {
      const { token, user } = authResult;
      res.cookie('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 3600000, // 1 hour
        path: '/',
      });
      res.json(user);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const seedAdminUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.seedAdminUser();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error seeding admin user', error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    
    // Se o usuário criado tem role "dentist", criar também um registro na tabela dentists
    if (req.body.role === 'dentist') {
      const dentistData = {
        name: req.body.name,
        specialty: req.body.specialty || 'Odontologia Geral',
        email: req.body.email || `${req.body.username}@clinica.com`,
        phone: req.body.phone || '',
        experience: req.body.experience || '0 anos',
        patients: 0,
        specializations: req.body.specializations || ['Odontologia Geral']
      };
      
      // Importar e usar o serviço de dentistas
      const dentistService = require('../services/dentistService');
      await dentistService.createDentist(dentistData);
    }
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id);
    if (deletedUser) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('session_token', { path: '/' });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const checkSession = (req: any, res: Response) => {
  // O middleware authenticateToken já validou o token e anexou o usuário ao req
  res.status(200).json(req.user);
};
