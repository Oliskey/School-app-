import React, { useState } from 'react';
import { Check, Shield, Zap, Star } from 'lucide-react';
import { initializePaystackPayment, initializeFlutterwavePayment } from '../../../lib/paymentGateways';
import { toast } from 'react-hot-toast';

interface PlanProps {
    id: number;
    name: string;
    price: number;
    currency: string;
    features: string[];
    recommended?: boolean;
    onSelect: (id: number) => void;
    loading?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({ id, name, price, currency, features, recommended, onSelect, loading }) => (
    <div className={`relative flex flex-col p-6 rounded-2xl transition-all duration-300 ${recommended ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl scale-105 z-10' : 'bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md'}`}>
        {recommended && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
            </div>
        )}
        <h3 className={`text-lg font-bold ${recommended ? 'text-indigo-100' : 'text-gray-500'}`}>{name}</h3>
        <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold tracking-tight">₦{price.toLocaleString()}</span>
            <span className={`ml-1 text-sm font-medium ${recommended ? 'text-indigo-200' : 'text-gray-500'}`}>/month</span>
        </div>
        <ul className="mt-6 space-y-4 flex-1">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${recommended ? 'bg-indigo-500' : 'bg-green-100'}`}>
                        <Check className={`w-3.5 h-3.5 ${recommended ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <span className={`ml-3 text-sm ${recommended ? 'text-indigo-50' : 'text-gray-600'}`}>{feature}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={() => onSelect(id)}
            disabled={loading}
            className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${recommended
                ? 'bg-white text-indigo-600 hover:bg-gray-50'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
        >
            {loading ? 'Processing...' : `Get Started with ${name}`}
        </button>
    </div>
);

interface PaymentPageProps {
    schoolName?: string;
    email?: string; // School admin email
    onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ schoolName = "Your School", email = "admin@school.edu", onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

    const plans = [
        {
            id: 1,
            name: "Basic",
            price: 15000,
            currency: "NGN",
            features: ["Up to 200 Students", "Baisc Reporting", "Attendance Tracking", "Email Support"]
        },
        {
            id: 2,
            name: "Standard",
            price: 35000,
            currency: "NGN",
            recommended: true,
            features: ["Up to 1,000 Students", "CBT Exams", "Finance Management", "Priority Support", "Parent Portal"]
        },
        {
            id: 3,
            name: "Premium",
            price: 75000,
            currency: "NGN",
            features: ["Unlimited Students", "AI Lesson Planner", "Mobile App Access", "Dedicated Account Manager", "API Access"]
        }
    ];

    const handleSelectPlan = async (planId: number) => {
        setSelectedPlanId(planId);
        setLoading(true);

        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        const gateway = window.confirm("Choose Payment Gateway:\nOK for Paystack\nCancel for Flutterwave") ? 'paystack' : 'flutterwave';

        const config = {
            email,
            amount: plan.price,
            currency: plan.currency,
            reference: `SUB-${Date.now()}`,
            callback_url: window.location.href, // In reality, handle callback
            metadata: { plan_id: planId, school_name: schoolName }
        };

        try {
            if (gateway === 'paystack') {
                initializePaystackPayment({
                    ...config,
                    onSuccess: (response: any) => {
                        console.log("Paystack Success", response);
                        toast.success("Payment Successful! Activating...");
                        onSuccess();
                    },
                    onClose: () => {
                        setLoading(false);
                        toast("Payment window closed");
                    }
                });
            } else {
                initializeFlutterwavePayment({
                    ...config,
                    customer: {
                        email: config.email,
                        phonenumber: '0000000000',
                        name: schoolName,
                    },
                    customizations: {
                        title: `Subscription for ${schoolName}`,
                        description: `Payment for ${plan.name} plan`,
                        logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
                    },
                    onSuccess: (data: any) => {
                        console.log("Flutterwave Success", data);
                        toast.success("Payment Successful! Activating...");
                        onSuccess();
                    },
                    onClose: () => {
                        setLoading(false);
                        toast("Payment window closed");
                    }
                });
            }
        } catch (err: any) {
            console.error("Payment Init Error", err);
            toast.error("Failed to initialize payment: " + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Zap className="w-6 h-6" fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Activate Your School</h1>
                            <p className="text-sm text-gray-500">{schoolName}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Need help? <a href="#" className="text-indigo-600 font-medium">Contact Sales</a>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Choose the right plan for your school</h2>
                        <p className="mt-4 text-xl text-gray-500">Simple pricing, no hidden fees. Upgrade or cancel anytime.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 items-start">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                {...plan}
                                onSelect={handleSelectPlan}
                                loading={loading && selectedPlanId === plan.id}
                            />
                        ))}
                    </div>

                    <div className="mt-16 bg-indigo-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-indigo-900">Secure Payment Guaranteed</h4>
                                <p className="text-indigo-700">Your payment information is encrypted and secure.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                            {/* Mock Logos for Paystack/Flutterwave */}
                            <div className="h-8 font-bold text-xl text-blue-900 flex items-center gap-1"><span className="w-4 h-4 bg-blue-900 rounded-sm"></span> Paystack</div>
                            <div className="h-8 font-bold text-xl text-orange-500 flex items-center gap-1"><span className="w-4 h-4 rounded-full border-2 border-orange-500"></span> Flutterwave</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
