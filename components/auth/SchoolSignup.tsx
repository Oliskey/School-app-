import React, { useState } from 'react';
import { SchoolLogoIcon, UserIcon } from '../../constants';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { DashboardType } from '../../types';

interface SchoolSignupProps {
    onComplete: (email: string, role: string) => void;
    onBack: () => void;
}

const SchoolSignup: React.FC<SchoolSignupProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolEmail: '',
        phone: '',
        address: '',
        adminName: '',
        adminEmail: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size must be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        // Validation Step 1
        if (step === 1) {
            if (!formData.schoolName || !formData.schoolEmail || !formData.phone) {
                toast.error("Please fill in all required school details.");
                return;
            }
        }
        // Validation Step 2
        if (step === 2) {
            if (!formData.adminName || !formData.adminEmail || !formData.password) {
                toast.error("Please fill in all required admin details.");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
            if (formData.password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleCreateAccount = async () => {
        setLoading(true);

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.adminEmail,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.adminName,
                        role: 'admin',
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User creation failed. Please try again.");

            // 2. Create School
            // For MVP, we don't upload the logo to storage yet, we just generate a placeholder or leave null.
            const logoUrl = logoPreview ? `https://ui-avatars.com/api/?name=${formData.schoolName.replace(/ /g, '+')}&background=random` : null;

            const { data: schoolData, error: schoolError } = await supabase
                .from('schools')
                .insert({
                    name: formData.schoolName,
                    email: formData.schoolEmail,
                    phone: formData.phone,
                    address: formData.address,
                    logo_url: logoUrl,
                    subscription_status: 'trial',
                    slug: formData.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000)
                })
                .select()
                .single();

            if (schoolError) throw schoolError;

            // 3. Create Trial Subscription
            const { error: subError } = await supabase
                .from('subscriptions')
                .insert({
                    school_id: schoolData.id,
                    plan_id: 1, // Basic Plan ID
                    status: 'trial',
                    start_date: new Date().toISOString(),
                });

            if (subError) console.error("Subscription creation warning:", subError);

            // 4. Link User to School (Update Profile)
            // Attempt to update existing profile (Trigger might have created it) or insert if missing
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    school_id: schoolData.id,
                    role: 'admin',
                    full_name: formData.adminName,
                    phone_number: formData.phone
                })
                .eq('id', authData.user.id);

            // Insert into Users table (Legacy / Central User Registry)
            await supabase.from('users').insert({
                email: formData.adminEmail,
                name: formData.adminName,
                role: 'Admin',
                avatar_url: `https://ui-avatars.com/api/?name=${formData.adminName.replace(/ /g, '+')}`
            });

            if (profileError) {
                // If update fails, maybe insert? Triggers usually handle profile creation.
                console.warn("Profile update failed", profileError);
            }

            toast.success("School Account Created! Redirecting...");

            // Allow a moment for toast
            setTimeout(() => {
                onComplete(formData.adminEmail, 'admin');
            }, 1000);

        } catch (error: any) {
            console.error("Signup Error", error);
            if (error.message.includes('already registered')) {
                toast.error("This email is already registered.");
            } else {
                toast.error("Failed to create account: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            {/* Sidebar (Purple) */}
            <div className="hidden lg:flex flex-col w-80 bg-indigo-600 text-white p-8 justify-between relative overflow-hidden transition-all duration-300">
                {/* Background decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <SchoolLogoIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight">SchoolApp</h1>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Start your journey</h2>
                            <p className="text-indigo-200 text-sm leading-relaxed">Join thousands of schools managing their operations efficiently with our all-in-one platform.</p>
                        </div>

                        {/* Steps Indicator */}
                        <div className="space-y-6 mt-8">
                            <StepIndicator number={1} title="School Details" active={step >= 1} current={step === 1} />
                            <div className={`h-8 w-0.5 ml-4 ${step > 1 ? 'bg-indigo-400' : 'bg-indigo-800'}`}></div>
                            <StepIndicator number={2} title="Admin Setup" active={step >= 2} current={step === 2} />
                            <div className={`h-8 w-0.5 ml-4 ${step > 2 ? 'bg-indigo-400' : 'bg-indigo-800'}`}></div>
                            <StepIndicator number={3} title="Confirmation" active={step >= 3} current={step === 3} />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-indigo-300">
                    &copy; 2026 SchoolApp Inc.
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative w-full">
                {/* Mobile Header / Back Button */}
                <div className="p-6 flex justify-between items-center bg-white border-b lg:border-none">
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <SchoolLogoIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">SchoolApp</span>
                    </div>
                    <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 ml-auto">
                        Back to Login
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white p-0 lg:p-10 rounded-2xl shadow-sm lg:shadow-xl border border-gray-100/50">
                        {step === 1 && (
                            <div className="animate-fade-in space-y-6 p-6 lg:p-0">
                                <h2 className="text-2xl font-bold text-gray-800">School Details</h2>
                                <p className="text-sm text-gray-500 -mt-4">Tell us about your institution.</p>

                                <div className="space-y-4">
                                    {/* Logo Upload */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative group cursor-pointer">
                                            <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${logoPreview ? 'border-indigo-500' : 'border-gray-300 group-hover:border-indigo-400 bg-gray-50'}`}>
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center text-gray-400">
                                                        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        <span className="text-[10px] uppercase font-bold">Upload Logo</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white shadow-md">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <Input label="School Name" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="e.g. Springfield High School" />
                                    <Input label="School Email" name="schoolEmail" type="email" value={formData.schoolEmail} onChange={handleChange} placeholder="info@springfield.edu" />
                                    <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+234 800 000 0000" />
                                    <Input label="Address (Optional)" name="address" value={formData.address} onChange={handleChange} placeholder="123 Education Lane, Lagos" />
                                </div>
                                <div className="pt-4">
                                    <Button onClick={nextStep}>Next Step</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in space-y-6 p-6 lg:p-0">
                                <h2 className="text-2xl font-bold text-gray-800">Admin Setup</h2>
                                <p className="text-sm text-gray-500 -mt-4">Create the principal/admin account.</p>

                                <div className="space-y-4">
                                    <Input label="Admin Name (Principal)" name="adminName" value={formData.adminName} onChange={handleChange} placeholder="Dr. John Doe" />
                                    <Input label="Admin Login Email" name="adminEmail" type="email" value={formData.adminEmail} onChange={handleChange} placeholder="principal@springfield.edu" />
                                    <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                    <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button onClick={prevStep} secondary>Back</Button>
                                    <Button onClick={nextStep}>Next Step</Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in space-y-6 p-6 lg:p-0">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Confirm Details</h2>
                                    <p className="text-sm text-gray-500">Please review your information.</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-100">
                                    <ReviewItem label="School Name" value={formData.schoolName} />
                                    <ReviewItem label="School Email" value={formData.schoolEmail} />
                                    <ReviewItem label="Admin Name" value={formData.adminName} />
                                    <ReviewItem label="Admin Email" value={formData.adminEmail} />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button onClick={prevStep} secondary>Back</Button>
                                    <Button onClick={handleCreateAccount} loading={loading}>Create Account</Button>
                                </div>
                                <p className="text-xs text-center text-gray-400 mt-2">By clicking Create Account, you agree to our Terms of Service.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components for cleaner code
const StepIndicator: React.FC<{ number: number, title: string, active: boolean, current: boolean }> = ({ number, title, active, current }) => (
    <div className={`flex items-center gap-4 ${active ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${current ? 'bg-white text-indigo-600 shadow-lg scale-110' : active ? 'bg-indigo-500 text-white' : 'bg-indigo-900/50 text-indigo-300'}`}>
            {active && !current ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : number}
        </div>
        <span className={`font-medium ${current ? 'text-white' : 'text-indigo-200'}`}>{title}</span>
    </div>
);

const Input: React.FC<any> = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
        <input {...props} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" />
    </div>
);

const Button: React.FC<any> = ({ children, secondary, loading, ...props }) => (
    <button {...props} disabled={loading} className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${secondary
        ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
        }`}>
        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
        {children}
    </button>
);

const ReviewItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
);

export default SchoolSignup;
