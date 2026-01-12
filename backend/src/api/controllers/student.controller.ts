import { Request, Response } from 'express';
import * as SupabaseService from '../services/supabase.service';

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await SupabaseService.getAllStudents();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students' });
    }
};

export const getStudentById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const student = await SupabaseService.getStudentById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student' });
    }
};
