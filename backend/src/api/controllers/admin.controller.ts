/**
 * Admin Controller - Full CRUD with Supabase
 * Handles all admin operations through the Express backend
 */

import { Request, Response } from 'express';
import * as SupabaseService from '../services/supabase.service';

// ============================================
// DASHBOARD
// ============================================

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await SupabaseService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// ============================================
// STUDENTS CRUD
// ============================================

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await SupabaseService.getAllStudents();
        res.json(students);
    } catch (error: any) {
        console.error('Get students error:', error);
        res.status(500).json({
            message: 'Error fetching students',
            error: error.message
        });
    }
};

export const getStudentById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const student = await SupabaseService.getStudentById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error: any) {
        console.error('Get student error:', error);
        res.status(500).json({
            message: 'Error fetching student',
            error: error.message
        });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const student = await SupabaseService.createStudent(req.body);
        res.status(201).json(student);
    } catch (error: any) {
        console.error('Create student error:', error);
        res.status(500).json({
            message: 'Error creating student',
            error: error.message
        });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const student = await SupabaseService.updateStudent(id, req.body);
        res.json(student);
    } catch (error: any) {
        console.error('Update student error:', error);
        res.status(500).json({
            message: 'Error updating student',
            error: error.message
        });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await SupabaseService.deleteStudent(id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        console.error('Delete student error:', error);
        res.status(500).json({
            message: 'Error deleting student',
            error: error.message
        });
    }
};

// ============================================
// TEACHERS CRUD
// ============================================

export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await SupabaseService.getAllTeachers();
        res.json(teachers);
    } catch (error: any) {
        console.error('Get teachers error:', error);
        res.status(500).json({
            message: 'Error fetching teachers',
            error: error.message
        });
    }
};

export const getTeacherById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const teacher = await SupabaseService.getTeacherById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error: any) {
        console.error('Get teacher error:', error);
        res.status(500).json({
            message: 'Error fetching teacher',
            error: error.message
        });
    }
};

export const createTeacher = async (req: Request, res: Response) => {
    try {
        const teacher = await SupabaseService.createTeacher(req.body);
        res.status(201).json(teacher);
    } catch (error: any) {
        console.error('Create teacher error:', error);
        res.status(500).json({
            message: 'Error creating teacher',
            error: error.message
        });
    }
};

export const updateTeacher = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const teacher = await SupabaseService.updateTeacher(id, req.body);
        res.json(teacher);
    } catch (error: any) {
        console.error('Update teacher error:', error);
        res.status(500).json({
            message: 'Error updating teacher',
            error: error.message
        });
    }
};

export const deleteTeacher = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await SupabaseService.deleteTeacher(id);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error: any) {
        console.error('Delete teacher error:', error);
        res.status(500).json({
            message: 'Error deleting teacher',
            error: error.message
        });
    }
};

// ============================================
// FEE MANAGEMENT
// ============================================

export const getAllFees = async (req: Request, res: Response) => {
    try {
        const fees = await SupabaseService.getAllFees();
        res.json(fees);
    } catch (error: any) {
        console.error('Get fees error:', error);
        res.status(500).json({
            message: 'Error fetching fees',
            error: error.message
        });
    }
};

export const updateFeeStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status, amountPaid } = req.body;
        const fee = await SupabaseService.updateFeeStatus(id, status, amountPaid);
        res.json(fee);
    } catch (error: any) {
        console.error('Update fee error:', error);
        res.status(500).json({
            message: 'Error updating fee',
            error: error.message
        });
    }
};

// ============================================
// NOTICES
// ============================================

export const getAllNotices = async (req: Request, res: Response) => {
    try {
        const notices = await SupabaseService.getAllNotices();
        res.json(notices);
    } catch (error: any) {
        console.error('Get notices error:', error);
        res.status(500).json({
            message: 'Error fetching notices',
            error: error.message
        });
    }
};

export const createNotice = async (req: Request, res: Response) => {
    try {
        const notice = await SupabaseService.createNotice(req.body);
        res.status(201).json(notice);
    } catch (error: any) {
        console.error('Create notice error:', error);
        res.status(500).json({
            message: 'Error creating notice',
            error: error.message
        });
    }
};

export const deleteNotice = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await SupabaseService.deleteNotice(id);
        res.json({ message: 'Notice deleted successfully' });
    } catch (error: any) {
        console.error('Delete notice error:', error);
        res.status(500).json({
            message: 'Error deleting notice',
            error: error.message
        });
    }
};

// ============================================
// ATTENDANCE
// ============================================

export const saveAttendance = async (req: Request, res: Response) => {
    try {
        const { records } = req.body;
        const attendance = await SupabaseService.saveAttendance(records);
        res.json(attendance);
    } catch (error: any) {
        console.error('Save attendance error:', error);
        res.status(500).json({
            message: 'Error saving attendance',
            error: error.message
        });
    }
};

export const getAttendance = async (req: Request, res: Response) => {
    try {
        const { className, date } = req.query;
        if (!className || !date) {
            return res.status(400).json({ message: 'className and date are required' });
        }
        const attendance = await SupabaseService.getAttendanceByClass(
            className as string,
            date as string
        );
        res.json(attendance);
    } catch (error: any) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

// ============================================
// PARENTS
// ============================================

export const getAllParents = async (req: Request, res: Response) => {
    try {
        const parents = await SupabaseService.getAllParents();
        res.json(parents);
    } catch (error: any) {
        console.error('Get parents error:', error);
        res.status(500).json({
            message: 'Error fetching parents',
            error: error.message
        });
    }
};
