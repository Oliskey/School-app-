
import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';

// Create a new CBT Test (with mock Excel upload logic)
export const createTest = async (req: Request, res: Response) => {
    // @ts-ignore
    const teacherUserId = req.user.id;
    const { title, type, className, subject, duration, questions } = req.body;

    try {
        const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', teacherUserId).single();
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });

        // 1. Create Test
        const { data: test, error: testError } = await supabase.from('cbt_tests').insert([{
            teacher_id: teacher.id,
            title,
            type,
            class_name: className,
            subject,
            duration,
            questions_count: questions.length,
            is_published: false
        }]).select().single();

        if (testError || !test) throw testError || new Error("Failed to create test");

        // 2. Create Questions
        const questionsData = questions.map((q: any) => ({
            test_id: test.id,
            text: q.text,
            options: q.options, // Assuming JSONB or array
            correct_answer: q.correctAnswer
        }));

        const { error: qError } = await supabase.from('cbt_questions').insert(questionsData);
        if (qError) throw qError;

        res.status(201).json({ ...test, questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create test" });
    }
};

export const getTestsByTeacher = async (req: Request, res: Response) => {
    // @ts-ignore
    const teacherUserId = req.user.id;
    try {
        const { data: teacher } = await supabase.from('teachers').select('id').eq('user_id', teacherUserId).single();
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const { data: tests } = await supabase
            .from('cbt_tests')
            .select('*')
            .eq('teacher_id', teacher.id)
            .order('created_at', { ascending: false });

        // Transform if needed to match frontend camelCase expectations, or frontend adapts
        res.json(tests || []);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tests" });
    }
};

export const togglePublishTest = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: test } = await supabase.from('cbt_tests').select('is_published').eq('id', id).single();
        if (!test) return res.status(404).json({ message: "Test not found" });

        const { data: updated } = await supabase
            .from('cbt_tests')
            .update({ is_published: !test.is_published })
            .eq('id', id)
            .select()
            .single();

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating test" });
    }
};

export const deleteTest = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Cascade delete handled by DB usually, but explicit delete for safety if not configured
        await supabase.from('cbt_questions').delete().eq('test_id', id);
        await supabase.from('cbt_results').delete().eq('test_id', id);
        await supabase.from('cbt_tests').delete().eq('id', id);

        res.json({ message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting test" });
    }
};

export const getAvailableTests = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentUserId = req.user.id;
    try {
        const { data: student } = await supabase.from('students').select('id, grade, section').eq('user_id', studentUserId).single();
        if (!student) return res.status(404).json({ message: "Student not found" });

        const studentClass = `${student.grade}${student.section}`;
        // e.g. "10A" if grade=10, section=A. 
        // Or if class_name stored as "Grade 10A", need logic. 
        // Going with simple generic match for now.

        const { data: tests } = await supabase
            .from('cbt_tests')
            .select(`
                *,
                questions:cbt_questions(*),
                results:cbt_results(*)
            `)
            .eq('is_published', true)
            // .or(`class_name.eq.${studentClass},class_name.eq.All`) // Supabase syntax for OR
            // simplifying to fetch all published and filter in memory if OR syntax gets tricky without specific setup
            .order('created_at', { ascending: false });

        res.json(tests || []);
    } catch (error) {
        res.status(500).json({ message: "Error fetching available tests" });
    }
};

export const submitTest = async (req: Request, res: Response) => {
    // @ts-ignore
    const studentUserId = req.user.id;
    const { id } = req.params;
    const { score, total, percentage } = req.body;

    try {
        const { data: student } = await supabase.from('students').select('id').eq('user_id', studentUserId).single();
        if (!student) return res.status(404).json({ message: "Student not found" });

        const { data: result } = await supabase.from('cbt_results').insert([{
            test_id: parseInt(id),
            student_id: student.id,
            score,
            total,
            percentage
        }]).select().single();

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error submitting test" });
    }
};

export const getTestResults = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: results } = await supabase
            .from('cbt_results')
            .select(`
                *,
                student:students(
                    user:users(name)
                )
            `)
            .eq('test_id', parseInt(id));

        // Transform for frontend
        const formattedResults = (results || []).map((r: any) => ({
            studentId: r.student_id,
            studentName: r.student?.user?.name || 'Unknown',
            score: r.score,
            totalQuestions: r.total,
            percentage: r.percentage,
            submittedAt: r.created_at // Assuming created_at is timestamp
        }));

        res.json(formattedResults);
    } catch (error) {
        res.status(500).json({ message: "Error fetching results" });
    }
};
