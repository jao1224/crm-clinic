import { Request, Response } from 'express';
import * as financeService from '../services/financeService';

export const getAllFinances = async (req: Request, res: Response) => {
  try {
    const finances = await financeService.getAllFinances();
    res.json(finances);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching finances', error });
  }
};

export const getFinanceById = async (req: Request, res: Response) => {
  try {
    const finance = await financeService.getFinanceById(req.params.id);
    if (finance) {
      res.json(finance);
    } else {
      res.status(404).json({ message: 'Finance record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching finance record', error });
  }
};

export const createFinance = async (req: Request, res: Response) => {
  try {
    const newFinance = await financeService.createFinance(req.body);
    res.status(201).json(newFinance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating finance record', error });
  }
};

export const updateFinance = async (req: Request, res: Response) => {
  try {
    const updatedFinance = await financeService.updateFinance(req.params.id, req.body);
    if (updatedFinance) {
      res.json(updatedFinance);
    } else {
      res.status(404).json({ message: 'Finance record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating finance record', error });
  }
};

export const deleteFinance = async (req: Request, res: Response) => {
  try {
    const deletedFinance = await financeService.deleteFinance(req.params.id);
    if (deletedFinance) {
      res.json({ message: 'Finance record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Finance record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting finance record', error });
  }
};
