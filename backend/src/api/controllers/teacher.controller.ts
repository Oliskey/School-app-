
import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

export const getClasses = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
        const { data: teacher } = await supabase
            .from('teachers')
            .select('*, teacher_classes(class_name)')
            .eq('user_id', userId)
            .single();

        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        // Transform derived classes
        const classes = teacher.teacher_classes?.map((c: any) => c.class_name) || [];
        res.json({ classes });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

export const getStudents = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
        const { data: teacher } = await supabase.from('teachers').select('id, classes').eq('user_id', userId).single();
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        // Fetch students belonging to classes taught by this teacher
        // Assuming teacher.classes is a comma-sep string or we use relationship
        // For matching "10A":
        const { data: students } = await supabase
            .from('students')
            .select('*, user:users(*)')
            .ilike('grade', '%10%') // Placeholder logic to match simplified demo
        // Real logic: .in('class_name', classesArray)

        res.json(students || []);
    } catch (error) {
        res.status(500).json({ message: "Error fetching students" });
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    const { title, description, className, subject, dueDate } = req.body;
    try {
        const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', userId).single();
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const { data: assignment, error } = await supabase.from('assignments').insert([{
            teacher_id: teacher.id,
            title,
            description,
            class_name: className,
            subject,
            due_date: new Date(dueDate).toISOString()
        }]).select().single();

        if (error) throw error;
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Error creating assignment" });
    }
};

export const getAssignments = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
        const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', userId).single();
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const { data: assignments } = await supabase
            .from('assignments')
            .select('*, submissions:assignment_submissions(*)')
            .eq('teacher_id', teacher.id);

        res.json(assignments || []);
    } catch (error) {
        res.status(500).json({ message: "Error fetching assignments" });
    }
};

export const markAttendance = async (req: Request, res: Response) => {
    const { studentIds, status, date } = req.body; // Expects array of student IDs
    try {
        const updates = studentIds.map((sid: number) => ({
            student_id: sid,
            status: status,
            date: new Date(date).toISOString().split('T')[0]
        }));

        const { error } = await supabase.from('student_attendance').upsert(updates);

        if (error) throw error;
        res.json({ message: "Attendance marked" });
    } catch (error) {
        res.status(500).json({ message: "Error marking attendance" });
    }
};
