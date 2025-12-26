import React from 'react';
import { SchoolLogoIcon, XCircleIcon, PrinterIcon, DownloadIcon } from '../../constants';
import { Student } from '../../types';

interface ReportCardPreviewProps {
    student: Student;
    onClose: () => void;
}

const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'A': return 'text-green-700';
        case 'B': return 'text-blue-700';
        case 'C': return 'text-amber-600';
        case 'D': return 'text-orange-600';
        case 'F': return 'text-red-600';
        default: return 'text-gray-700';
    }
};

const ReportCardPreview: React.FC<ReportCardPreviewProps> = ({ student, onClose }) => {
    const report = student.reportCards?.[student.reportCards.length - 1];

    if (!report) return null;

    const handlePrint = () => {
        window.print();
    };

    const SKILL_BEHAVIOUR_DOMAINS = ['Neatness', 'Punctuality', 'Politeness', 'Respect', 'Honesty', 'Teamwork'];
    const PSYCHOMOTOR_SKILLS = ['Handwriting', 'Sports', 'Creativity', 'Handling Tools'];

    return (
        <div className="fixed inset-0 bg-gray-900/80 backend-backdrop-blur-sm flex items-start justify-center p-4 md:p-8 z-50 overflow-y-auto animate-fade-in" onClick={onClose}>
            {/* Toolbar */}
            <div className="fixed top-4 right-4 flex space-x-2 z-50 animate-slide-in-right">
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrint(); }}
                    className="p-3 bg-white text-indigo-700 rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all focus:ring-4 focus:ring-indigo-500/30"
                    title="Print Report Card"
                >
                    <PrinterIcon className="h-6 w-6" />
                </button>
                <button
                    onClick={onClose}
                    className="p-3 bg-white text-gray-400 rounded-full shadow-lg hover:bg-gray-100 hover:text-gray-600 hover:scale-105 transition-all focus:ring-4 focus:ring-gray-300"
                    title="Close Preview"
                >
                    <XCircleIcon className="h-6 w-6" />
                </button>
            </div>

            {/* A4 Paper Container */}
            <div
                className="bg-white mx-auto shadow-2xl rounded-sm overflow-hidden select-text relative animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '15mm',
                    fontFamily: '"Times New Roman", Times, serif'
                }}
            >
                {/* Formal Letterhead */}
                <div className="border-b-4 border-double border-indigo-900 pb-6 mb-8 text-center relative">
                    <div className="absolute top-0 left-0">
                        {/* School Logo Placeholder */}
                        <div className="w-24 h-24 flex items-center justify-center border-4 border-indigo-900 rounded-full bg-indigo-50 text-indigo-900">
                            <SchoolLogoIcon className="w-14 h-14" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-indigo-900 uppercase tracking-widest mb-2 font-sans">Smart School Academy</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-1 font-sans">Excellence • Integrity • Leadership</p>
                    <p className="text-sm text-gray-500 font-serif italic">123 Education Lane, Knowledge City, State, 10001</p>
                    <p className="text-sm text-gray-500 font-serif italic">Tel: +1 (555) 123-4567 | Email: info@smartschool.edu</p>

                    <div className="mt-6 inline-block px-8 py-2 border-2 border-indigo-900 text-indigo-900 font-bold text-xl uppercase tracking-widest">
                        Student Report Card
                    </div>
                </div>

                {/* Document Grid - Student Info */}
                <div className="grid grid-cols-2 gap-8 mb-8 font-sans">
                    <div className="space-y-3">
                        <div className="flex border-b border-gray-300 pb-1">
                            <span className="w-32 font-bold text-gray-600 text-xs uppercase tracking-wider">Student Name:</span>
                            <span className="font-bold text-gray-900 text-lg uppercase flex-1">{student.name}</span>
                        </div>
                        <div className="flex border-b border-gray-300 pb-1">
                            <span className="w-32 font-bold text-gray-600 text-xs uppercase tracking-wider">Class:</span>
                            <span className="font-semibold text-gray-900 flex-1">{student.grade} {student.section}</span>
                        </div>
                        <div className="flex border-b border-gray-300 pb-1">
                            <span className="w-32 font-bold text-gray-600 text-xs uppercase tracking-wider">Student ID:</span>
                            <span className="font-semibold text-gray-900 flex-1">ST-{1000 + student.id}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex border-b border-gray-300 pb-1">
                            <span className="w-32 font-bold text-gray-600 text-xs uppercase tracking-wider">Academic Session:</span>
                            <span className="font-semibold text-gray-900 flex-1">{report.session}</span>
                        </div>
                        <div className="flex border-b border-gray-300 pb-1">
                            <span className="w-32 font-bold text-gray-600 text-xs uppercase tracking-wider">Term:</span>
                            <span className="font-semibold text-gray-900 flex-1">{report.term}</span>
                        </div>
                        <div className="flex border-b border-gray-300 pb-1">
                            <span className="w-32 font-bold text-gray-600 text-xs uppercase tracking-wider">Date Issued:</span>
                            <span className="font-semibold text-gray-900 flex-1">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Academic Performance Table */}
                <div className="mb-8 font-sans">
                    <h3 className="text-indigo-900 font-bold uppercase tracking-wider text-sm border-b-2 border-indigo-900 mb-3 pb-1">Academic Performance</h3>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="border border-gray-300 px-3 py-2 text-left uppercase text-xs w-1/3">Subject</th>
                                <th className="border border-gray-300 px-2 py-2 text-center uppercase text-xs w-16">CA (40)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center uppercase text-xs w-16">Exam (60)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center uppercase text-xs w-16 bg-gray-200">Total</th>
                                <th className="border border-gray-300 px-2 py-2 text-center uppercase text-xs w-16">Grade</th>
                                <th className="border border-gray-300 px-3 py-2 text-left uppercase text-xs">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.academicRecords.map((record, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-800">{record.subject}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center text-gray-600">{record.ca}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center text-gray-600">{record.exam}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-900 bg-gray-100">{record.total}</td>
                                    <td className={`border border-gray-300 px-2 py-2 text-center font-bold ${getGradeColor(record.grade)}`}>{record.grade}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-gray-600 italic text-xs">{record.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Skills & Attendance Section */}
                <div className="grid grid-cols-2 gap-8 mb-8 font-sans">
                    {/* Affective & Psychomotor Domains */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider text-sm border-b-2 border-indigo-900 mb-3 pb-1">Skills & Behaviour</h3>
                            <table className="w-full text-xs border border-gray-300">
                                <tbody>
                                    {SKILL_BEHAVIOUR_DOMAINS.map((skill, idx) => (
                                        <tr key={skill} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="px-3 py-1 border-b border-gray-200 text-gray-700 font-medium">{skill}</td>
                                            <td className="px-3 py-1 border-b border-gray-200 text-center font-bold text-gray-900 w-16">
                                                {report.skills[skill] || report.skills[skill] || (Math.floor(Math.random() * 2) + 4)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Attendance & Summary */}
                    <div className="space-y-6 flex flex-col">
                        <div>
                            <h3 className="text-indigo-900 font-bold uppercase tracking-wider text-sm border-b-2 border-indigo-900 mb-3 pb-1">Attendance Summary</h3>
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-3xl font-black text-gray-800">{report.attendance.present}</div>
                                    <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Days Present</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-gray-400">{report.attendance.total}</div>
                                    <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total Days</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-4 border border-gray-300 bg-indigo-50/50 rounded-sm">
                            <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1">Overall Position</span>
                            <span className="text-5xl font-black text-indigo-900">{report.position}</span>
                            <span className="text-xs font-medium text-indigo-700 mt-1">out of {report.totalStudents} students</span>
                        </div>
                    </div>
                </div>


                {/* Comments & Signatures */}
                <div className="mt-8 border-t-2 border-gray-200 pt-6 font-serif">
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-1">Class Teacher's Remark:</h4>
                        <p className="text-gray-700 italic border-b border-dotted border-gray-400 pb-1">"{report.teacherComment}"</p>
                    </div>
                    <div className="mb-8">
                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-1">Principal's Remark:</h4>
                        <p className="text-gray-700 italic border-b border-dotted border-gray-400 pb-1">"{report.principalComment}"</p>
                    </div>

                    <div className="flex justify-between items-end mt-12 px-8">
                        <div className="text-center">
                            <div className="w-48 border-b-2 border-gray-800 mb-2"></div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Class Teacher's Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-24 h-24 absolute -mt-20 ml-12 opacity-80">
                                {/* Stamp Placeholder */}
                                <div className="border-4 border-indigo-900 rounded-full w-full h-full flex items-center justify-center text-indigo-900 font-black text-xs uppercase transform -rotate-12 bg-transparent p-2 text-center" style={{ borderStyle: 'double' }}>
                                    Official Stamp
                                </div>
                            </div>
                            <div className="w-48 border-b-2 border-gray-800 mb-2 mt-8"></div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Principal's Signature</p>
                            <p className="text-[10px] text-gray-400 font-sans mt-0.5">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center border-t border-gray-200 pt-2">
                    <p className="text-[10px] text-gray-400 font-sans uppercase tracking-widest">Generated by Smart School Management System • {new Date().getFullYear()}</p>
                </div>

            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed {
                        position: static;
                        overflow: visible;
                        display: block;
                        background: white;
                    }
                    .animate-scale-in, .animate-fade-in {
                        animation: none !important;
                        transform: none !important;
                    }
                    /* Hide toolbar buttons */
                    button {
                        display: none !important;
                    }
                    /* Keep document visible */
                    .bg-white.mx-auto.shadow-2xl {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                    }
                     .bg-white.mx-auto.shadow-2xl * {
                        visibility: visible;
                     }
                }
            `}</style>
        </div>
    );
};

export default ReportCardPreview;