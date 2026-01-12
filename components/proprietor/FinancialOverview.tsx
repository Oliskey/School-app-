import React, { useState } from 'react';
import {
    DollarSign,
    CreditCard,
    Smartphone,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Send,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const FinancialOverview: React.FC = () => {
    const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'flutterwave'>('paystack');

    // Mock data for demo
    const revenueStats = {
        totalRevenue: 15500000,
        outstanding: 3200000,
        collectionRate: 82,
        projected: 18700000
    };

    const agingDebts = [
        { id: 1, name: 'Chioma Adebayo', amount: 150000, daysOverdue: 18, grade: 'JSS 2' },
        { id: 2, name: 'Emmanuel Okon', amount: 45000, daysOverdue: 7, grade: 'SS 1' },
        { id: 3, name: 'Precious Eze', amount: 200000, daysOverdue: 25, grade: 'Primary 5' },
    ];

    return (
        <div className="space-y-6">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-green-600">Total Revenue (YTD)</p>
                                <h3 className="text-2xl font-bold text-green-900 mt-1">₦15.5M</h3>
                            </div>
                            <div className="h-8 w-8 bg-green-200 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-700" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> +12% vs last term
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-red-600">Outstanding Debt</p>
                                <h3 className="text-2xl font-bold text-red-900 mt-1">₦3.2M</h3>
                            </div>
                            <div className="h-8 w-8 bg-red-200 rounded-lg flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-700" />
                            </div>
                        </div>
                        <p className="text-xs text-red-600 mt-2 font-medium">Critical focus needed</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Collection Efficiency</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">82%</h3>
                            </div>
                            <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-slate-600" />
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Projected Revenue</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">₦18.7M</h3>
                            </div>
                            <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-slate-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Debt Recovery Module */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 p-4">
                        <CardTitle className="text-base font-semibold flex items-center text-slate-800">
                            <Clock className="w-4 h-4 mr-2 text-red-500" />
                            Aging Debt Recovery
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Grade</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Overdue</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {agingDebts.map((debt) => (
                                        <tr key={debt.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{debt.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{debt.grade}</td>
                                            <td className="px-4 py-3 font-semibold text-red-600">₦{debt.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${debt.daysOverdue > 14 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {debt.daysOverdue} days
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium inline-flex items-center transition-colors">
                                                    <Send className="w-3 h-3 mr-1.5" />
                                                    Send Reminder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <button className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center justify-center">
                                View All Debtors
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Gateway Configuration & Quick Actions */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-4">
                            <CardTitle className="text-base font-semibold flex items-center text-slate-800">
                                <CreditCard className="w-4 h-4 mr-2 text-purple-500" />
                                Payment Gateways
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className={`p-3 rounded-lg border cursor-pointer transition-all ${paymentGateway === 'paystack' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-blue-200'
                                }`} onClick={() => setPaymentGateway('paystack')}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">P</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Paystack</p>
                                            <p className="text-xs text-green-600 font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Active</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">T+1 Settlement</div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg border cursor-pointer transition-all ${paymentGateway === 'flutterwave' ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-slate-200 hover:border-orange-200'
                                }`} onClick={() => setPaymentGateway('flutterwave')}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">F</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Flutterwave</p>
                                            <p className="text-xs text-slate-500 font-medium">Inactive</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                    <Smartphone className="w-4 h-4 text-slate-400" />
                                    <span>USSD Status: <span className="font-semibold text-green-600">Enabled (*737*...)</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-4">
                            <CardTitle className="text-base font-semibold flex items-center text-slate-800">
                                <Download className="w-4 h-4 mr-2 text-slate-500" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center justify-between group">
                                Download Financial Report (PDF)
                                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded flex items-center justify-between group">
                                Generate Promissory Note
                                <AlertCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
