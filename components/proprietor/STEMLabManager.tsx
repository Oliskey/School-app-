import React, { useState } from 'react';
import {
    Cpu,
    Box,
    QrCode,
    Play,
    PenTool,
    BrainCircuit,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const STEMLabManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'portfolios'>('inventory');

    const components = [
        { name: 'Arduino Uno R3', category: 'Microcontrollers', stock: 12, status: 'Good' },
        { name: 'ATMega16 Chip', category: 'Microcontrollers', stock: 45, status: 'Low Stock' },
        { name: 'Ultrasonic Sensor (HC-SR04)', category: 'Sensors', stock: 28, status: 'Good' },
        { name: 'DC Motor Driver (L298N)', category: 'Motors', stock: 8, status: 'Critical' },
    ];

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-cyan-700">Total Components</p>
                            <h3 className="text-2xl font-bold text-cyan-900 mt-1">2,450</h3>
                            <p className="text-xs text-cyan-600 mt-1">Value: ₦4.2M</p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-cyan-200">
                            <Box className="w-5 h-5 text-cyan-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Student Projects</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">128</h3>
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                <Play className="w-3 h-3 mr-1" /> 14 this week
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                            <PenTool className="w-5 h-5 text-slate-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">AI Tutor Usage</p>
                            <h3 className="text-2xl font-bold text-indigo-900 mt-1">45h 20m</h3>
                            <p className="text-xs text-slate-500 mt-1">Khanmigo Integration</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <Card className="border-slate-200 shadow-sm">
                <div className="border-b border-slate-200 px-4 py-2 flex justify-between items-center bg-slate-50 rounded-t-lg">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Component Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('portfolios')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'portfolios' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Student Portfolios
                        </button>
                    </div>
                    {activeTab === 'inventory' && (
                        <button className="flex items-center text-xs bg-indigo-600 text-white px-3 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                            <QrCode className="w-4 h-4 mr-1.5" />
                            Scan Item
                        </button>
                    )}
                </div>

                <CardContent className="p-0">
                    {activeTab === 'inventory' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3">Component Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Current Stock</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {components.map((comp, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                                                <Cpu className="w-4 h-4 mr-3 text-slate-400" />
                                                {comp.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{comp.category}</td>
                                            <td className="px-6 py-4 font-mono text-slate-700">{comp.stock} units</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${comp.status === 'Good' ? 'bg-green-100 text-green-800' :
                                                    comp.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                                <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Component
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'portfolios' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Portfolio Card 1 */}
                                <div className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                                        <Play className="w-12 h-12 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-slate-900">Automated Irrigation System</h4>
                                        <p className="text-xs text-slate-500 mt-1">By: Jessica Doe (SS 2)</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">C++ / Arduino</span>
                                            <button className="text-xs font-bold text-indigo-600 hover:underline">View Code</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Portfolio Card 2 */}
                                <div className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                                        <Play className="w-12 h-12 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-slate-900">Traffic Light Logic</h4>
                                        <p className="text-xs text-slate-500 mt-1">By: Ahmed Musa (JSS 3)</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Logic Gates</span>
                                            <button className="text-xs font-bold text-indigo-600 hover:underline">View Logic</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
