
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as AdminController from '../controllers/admin.controller';

const router = Router();

// Optional: Apply authentication to all admin routes
// router.use(authenticateToken);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', AdminController.getDashboardStats);

// ============================================
// STUDENTS CRUD
// ============================================
router.get('/students', AdminController.getAllStudents);
router.get('/students/:id', AdminController.getStudentById);
router.post('/students', AdminController.createStudent);
router.put('/students/:id', AdminController.updateStudent);
router.delete('/students/:id', AdminController.deleteStudent);

// ============================================
// TEACHERS CRUD
// ============================================
router.get('/teachers', AdminController.getAllTeachers);
router.get('/teachers/:id', AdminController.getTeacherById);
router.post('/teachers', AdminController.createTeacher);
router.put('/teachers/:id', AdminController.updateTeacher);
router.delete('/teachers/:id', AdminController.deleteTeacher);

// ============================================
// PARENTS
// ============================================
router.get('/parents', AdminController.getAllParents);

// ============================================
// FEE MANAGEMENT
// ============================================
router.get('/fees', AdminController.getAllFees);
router.put('/fees/:id/status', AdminController.updateFeeStatus);

// ============================================
// NOTICES
// ============================================
router.get('/notices', AdminController.getAllNotices);
router.post('/notices', AdminController.createNotice);
router.delete('/notices/:id', AdminController.deleteNotice);

// ============================================
// ATTENDANCE
// ============================================
router.get('/attendance', AdminController.getAttendance);
router.post('/attendance', AdminController.saveAttendance);

export default router;
