import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Student } from '../../types';
import { ChevronRightIcon, ReportIcon } from '../../constants';

interface SelectChildForReportScreenProps {
  navigateTo: (view: string, title: string, props?: any) => void;
  parentId?: number | null;
}

const SelectChildForReportScreen: React.FC<SelectChildForReportScreenProps> = ({ navigateTo, parentId }) => {
  const [children, setChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!parentId) {
        setLoading(false);
        return;
      }
      try {
        const { data: relations } = await supabase
          .from('parent_children')
          .select('student_id')
          .eq('parent_id', parentId);

        if (relations && relations.length > 0) {
          const studentIds = relations.map(r => r.student_id);
          const { data: students } = await supabase
            .from('students')
            .select('*')
            .in('id', studentIds);

          if (students) {
            const mappedStudents = students.map((s: any) => ({
              id: s.id,
              name: s.name,
              avatarUrl: s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`,
              grade: s.grade,
              section: s.section
            } as Student));
            setChildren(mappedStudents);
          }
        }
      } catch (err) {
        console.error("Error fetching children for report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [parentId]);

  if (loading) return <div className="p-8 text-center">Loading children...</div>;

  const handleSelectChild = (student: Student) => {
    navigateTo('reportCard', `${student.name}'s Report`, { student });
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 h-full">
      <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
        <ReportIcon className="h-10 w-10 mx-auto text-green-400 mb-2" />
        <h3 className="font-bold text-lg text-green-800">Select a Child</h3>
        <p className="text-sm text-green-700">Choose a child to view their latest academic report card.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => handleSelectChild(child)}
            className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between text-left hover:bg-gray-50 hover:ring-2 hover:ring-green-200 transition-all"
          >
            <div className="flex items-center space-x-4">
              <img src={child.avatarUrl} alt={child.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <p className="font-bold text-gray-800">{child.name}</p>
                <p className="text-sm text-gray-600">Grade {child.grade}{child.section}</p>
              </div>
            </div>
            <ChevronRightIcon className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectChildForReportScreen;