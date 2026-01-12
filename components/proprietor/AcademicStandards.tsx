import React, { useState } from 'react';
import {
    Book,
    Globe,
    ArrowRightLeft,
    BarChart2,
    Award,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const AcademicStandards: React.FC = () => {
    const [conversionMode, setConversionMode] = useState(false);

    const gradeDistribution = [
        { subject: 'Mathematics', nerdec: 'A1', igcse: '9' },
        { subject: 'English', nerdec: 'B2', igcse: '7' },
        { subject: 'Physics', nerdec: 'A1', igcse: '9' },
        { subject: 'Chemistry', nerdec: 'B3', igcse: '6' },
        { subject: 'Biology', nerdec: 'C4', igcse: '5' },
    ];

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Book className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">NERDC Compliance</p>
                            <h3 className="text-lg font-bold text-slate-900">100%</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">British Curriculum</p>
                            <h3 className="text-lg font-bold text-slate-900">Active (Key Stage 4)</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-purple-700" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Top Performance</p>
                            <h3 className="text-lg font-bold text-slate-900">SS 2 Science</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Grade Conversion Engine */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center text-slate-800">
                            <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-600" />
                            Hybrid Gradebook Engine
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-600">Conversion Mode</span>
                            <button
                                onClick={() => setConversionMode(!conversionMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${conversionMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${conversionMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">NERDC / WASSCE</th>
                                        <th className="px-4 py-3">
                                            <span className="flex items-center">
                                                British / IGCSE
                                                <Globe className="w-3 h-3 ml-1 text-slate-400" />
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {gradeDistribution.map((grade, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{grade.subject}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {grade.nerdec}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {conversionMode ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                                                        {grade.igcse} (Calc)
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Enable Conversion</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-slate-500">
                                                Synced
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
                            <button className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium shadow-sm hover:bg-slate-50 flex items-center">
                                <Download className="w-4 h-4 mr-2" />
                                Export Hybrid Transcript
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
                        <CardHeader className="border-b border-slate-800 p-4">
                            <CardTitle className="text-base font-semibold flex items-center">
                                <BarChart2 className="w-4 h-4 mr-2 text-blue-400" />
                                Subject Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Science (STEM)</span>
                                        <span className="text-green-400 font-bold">85% Avg</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Arts & Humanities</span>
                                        <span className="text-blue-400 font-bold">72% Avg</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">Languages</span>
                                        <span className="text-yellow-400 font-bold">68% Avg</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <p className="text-xs text-slate-400 text-center">
                                    Your school is performing <span className="text-green-400 font-bold">15% above</span> regional average in STEM subjects.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
