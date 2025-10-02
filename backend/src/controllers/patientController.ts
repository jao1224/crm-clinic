import { Request, Response } from 'express';
import * as patientService from '../services/patientService';

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await patientService.getAllPatients();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const newPatient = await patientService.createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating patient', error });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const updatedPatient = await patientService.updatePatient(req.params.id, req.body);
    if (updatedPatient) {
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const deletedPatient = await patientService.deletePatient(req.params.id);
    if (deletedPatient) {
      res.json({ message: 'Patient deleted successfully' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error });
  }
};
