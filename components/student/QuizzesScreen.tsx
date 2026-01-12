
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Quiz, Student } from '../../types';
import { SUBJECT_COLORS, HelpIcon, ChevronRightIcon, ClockIcon, ExamIcon, ClipboardListIcon, CheckCircleIcon } from '../../constants';
import { toast } from 'react-hot-toast';

interface QuizzesScreenProps {
  navigateTo: (view: string, title: string, props: any) => void;
  student: Student;
}

type QuizCategory = 'cbt' | 'quiz';

const QuizzesScreen: React.FC<QuizzesScreenProps> = ({ navigateTo, student }) => {
  const [activeCategory, setActiveCategory] = useState<QuizCategory>('cbt');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [activeCategory, student]);

  const fetchContent = async () => {
    if (!student) return;
    setLoading(true);
    try {
      if (activeCategory === 'cbt') {
        // Fetch CBT Exams with relations
        const { data: examsData, error: examError } = await supabase
          .from('cbt_exams')
          .select(`
              *,
              subjects ( name ),
              classes ( id, grade, section )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (examError) throw examError;

        // Fetch submissions
        const { data: submissions } = await supabase
          .from('cbt_submissions')
          .select('exam_id, score, status')
          .eq('student_id', student.id);

        const subMap: Record<string, any> = {};
        submissions?.forEach(s => { subMap[s.exam_id] = s; });

        // Filter and Merge
        const merged = (examsData || [])
          .filter((exam: any) => {
            // 1. If has class_id, match grade/section
            if (exam.classes) {
              return String(exam.classes.grade) === String(student.grade) &&
                (!exam.classes.section || exam.classes.section === student.section);
            }
            // 2. If has class_grade (text), match loosely
            if (exam.class_grade) {
              return exam.class_grade.toLowerCase().includes(String(student.grade).toLowerCase());
            }
            // 3. Fallback: if no class info, don't show to avoid clutter or show if it's general?
            // For safety, only show matched ones.
            return false;
          })
          .map((exam: any) => ({
            id: exam.id,
            title: exam.title,
            subject: exam.subjects?.name || 'General',
            className: exam.classes ? `Grade ${exam.classes.grade}${exam.classes.section}` : exam.class_grade,
            durationMinutes: exam.duration_minutes,
            submission: subMap[exam.id],
            type: 'cbt'
          }));

        setItems(merged);
      } else {
        // Fetch Regular Quizzes
        const { data: quizzesData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('is_published', true)
          .eq('grade', student.grade)
          .order('created_at', { ascending: false });

        if (quizError) throw quizError;

        const { data: submissions } = await supabase
          .from('quiz_submissions')
          .select('quiz_id, score, status')
          .eq('student_id', student.id);

        const subMap: Record<string, any> = {};
        submissions?.forEach(s => { subMap[s.quiz_id] = s; });

        const merged = (quizzesData || []).map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject,
          durationMinutes: quiz.duration_minutes,
          submission: subMap[quiz.id],
          type: 'quiz'
        }));
        setItems(merged);
      }
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError('general_error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (item: any) => {
    if (item.type === 'cbt') {
      navigateTo('quizPlayer', item.title, { cbtExamId: item.id, student });
    } else {
      navigateTo('quizPlayer', item.title, { quizId: item.id, student });
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24">

        {/* Category Selector */}
        <div className="space-y-3">
          <button
            onClick={() => setActiveCategory('cbt')}
            className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${activeCategory === 'cbt'
                ? 'bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-100'
                : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeCategory === 'cbt' ? 'bg-orange-500 text-white shadow-lg' : 'bg-orange-100 text-orange-600'}`}>
                <ExamIcon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-gray-800">CBT & Examinations</h3>
                <p className="text-sm text-gray-500">Take your scheduled exams and view results</p>
              </div>
              {activeCategory === 'cbt' && (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold scale-110 shadow-md">
                  ✓
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveCategory('quiz')}
            className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${activeCategory === 'quiz'
                ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100'
                : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeCategory === 'quiz' ? 'bg-blue-500 text-white shadow-lg' : 'bg-blue-100 text-blue-600'}`}>
                <ClipboardListIcon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-gray-800">Assessments & Quizzes</h3>
                <p className="text-sm text-gray-500">Practice your knowledge with fun quizzes</p>
              </div>
              {activeCategory === 'quiz' && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold scale-110 shadow-md">
                  ✓
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-gray-700">
              {activeCategory === 'cbt' ? 'Scheduled Exams' : 'Available Quizzes'}
            </h2>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl grayscale opacity-50">📋</span>
              </div>
              <h3 className="text-gray-800 font-bold mb-1">Nothing here yet</h3>
              <p className="text-gray-400 text-sm max-w-[200px] mx-auto">No {activeCategory === 'cbt' ? 'exams' : 'quizzes'} have been published for Grade {student.grade} yet.</p>
              <button
                onClick={fetchContent}
                className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Check again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map(item => {
                const colorClass = SUBJECT_COLORS[item.subject] || 'bg-gray-400 text-white';
                const [bgColor] = colorClass.split(' ');

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleStart(item)}
                    className="group w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between text-left hover:shadow-lg hover:ring-2 hover:ring-orange-200 transition-all border border-gray-100"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                        <HelpIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {item.className && (
                            <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                              {item.className}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 truncate pr-2 group-hover:text-orange-600 transition-colors">{item.title}</h4>
                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-100 font-medium px-2 py-0.5 rounded-md">{item.subject}</span>
                          {item.durationMinutes > 0 && (
                            <span className="flex items-center bg-gray-50 px-2 py-0.5 rounded-md">
                              <ClockIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                              {item.durationMinutes}m
                            </span>
                          )}
                          {item.submission && (
                            <span className="px-2 py-0.5 font-bold text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center gap-1">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              {item.submission.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                      <ChevronRightIcon className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizzesScreen;
