import React, { useState } from 'react';
import {
    ShieldCheck,
    BookOpen,
    Calendar,
    AlertTriangle,
    FileText,
    UserCheck,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const ComplianceTracker: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sslags' | 'records' | 'calendar'>('sslags');

    const complianceItems = [
        { title: 'Safe Recruitment Clearances', status: 'compliant', date: 'Oct 24, 2025' },
        { title: 'Fire Safety Certificate', status: 'expiring', date: 'Nov 15, 2025' },
        { title: 'Annual OEQA Payment', status: 'pending', date: 'Dec 01, 2025' },
    ];

    const registers = [
        { title: 'Admission Register', updated: 'Today, 09:30 AM', status: 'Up to date' },
        { title: 'Attendance Register', updated: 'Today, 08:15 AM', status: 'Up to date' },
        { title: 'Corporal Punishment Log', updated: '3 days ago', status: 'Review Needed' },
        { title: 'Visitor Log Book', updated: 'Yesterday', status: 'Up to date' },
    ];

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-indigo-600">SSLAG Status</p>
                            <h3 className="text-xl font-bold text-indigo-900 mt-1 flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-indigo-700" />
                                Compliant
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-green-400">
                            <span className="text-sm font-bold text-green-600">95%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-slate-500">Upcoming Inspection</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">NO SURPRISE VISITS</h3>
                        <p className="text-xs text-slate-500 mt-1">Next scheduled: Feb 2026</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-slate-500">Staff SRC Clearance</p>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">28 / 32</h3>
                        <p className="text-xs text-red-500 mt-1 font-medium">4 Pending Action</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <Card className="border-slate-200 shadow-sm">
                <div className="border-b border-slate-200">
                    <div className="flex space-x-1 px-4 pt-2">
                        <button
                            onClick={() => setActiveTab('sslags')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sslags' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            SSLAG Compliance
                        </button>
                        <button
                            onClick={() => setActiveTab('records')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'records' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Statutory Books
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Academic Calendar
                        </button>
                    </div>
                </div>

                <CardContent className="p-6">
                    {activeTab === 'sslags' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Compliance Checklist</h4>
                                <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md font-medium hover:bg-indigo-100 transition-colors">
                                    Download SSLAG Certificate
                                </button>
                            </div>
                            <div className="space-y-3">
                                {complianceItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all">
                                        <div className="flex items-center space-x-3">
                                            {item.status === 'compliant' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : item.status === 'expiring' ? (
                                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                            ) : (
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                                <p className="text-xs text-slate-500">Effective until: {item.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold uppercase ${item.status === 'compliant' ? 'text-green-600' : item.status === 'expiring' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h5 className="text-sm font-bold text-orange-900">RIDDOR Incident Log</h5>
                                    <p className="text-xs text-orange-700 mt-1">
                                        You have 0 open incidents. Remember to log any injury requiring first aid within 24 hours to remain compliant with Lagos State Safety Commission.
                                    </p>
                                    <button className="mt-2 text-xs bg-white text-orange-700 border border-orange-200 px-3 py-1 rounded font-medium shadow-sm hover:bg-orange-50">Log New Incident</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'records' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {registers.map((reg, idx) => (
                                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                            <BookOpen className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${reg.status === 'Up to date' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>{reg.status}</span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 mt-3">{reg.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">Last updated: {reg.updated}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="space-y-4">
                            <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <Calendar className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Lagos State Harmonized Calendar</h4>
                                        <p className="text-xs text-slate-500">2025/2026 Academic Session</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-600">Current Week</p>
                                    <h3 className="text-lg font-bold text-indigo-700">Week 8</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                    <h5 className="text-sm font-bold text-slate-800 mb-3">Upcoming State Dates</h5>
                                    <ul className="space-y-3">
                                        <li className="flex justify-between text-xs">
                                            <span className="text-slate-600">Mid-Term Break</span>
                                            <span className="font-medium text-slate-900">Oct 29 - Oct 30</span>
                                        </li>
                                        <li className="flex justify-between text-xs">
                                            <span className="text-slate-600">Unified Exams (MOCK)</span>
                                            <span className="font-medium text-slate-900">Nov 15 - Nov 22</span>
                                        </li>
                                        <li className="flex justify-between text-xs">
                                            <span className="text-slate-600">Vacation</span>
                                            <span className="font-medium text-slate-900">Dec 18</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <h5 className="text-sm font-bold text-blue-900 mb-2">Cambridge IGCSE Sync</h5>
                                    <p className="text-xs text-blue-700 mb-3">
                                        Your calendar is currently synchronized with the British Council exam timetable.
                                    </p>
                                    <button className="w-full py-2 bg-white text-blue-700 border border-blue-200 rounded text-xs font-medium hover:bg-blue-50">
                                        View Exam Conflicts
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
