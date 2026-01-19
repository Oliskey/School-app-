
export interface Plan {
    id: number;
    name: 'Basic' | 'Standard' | 'Premium';
    price: number; // Monthly price in base currency
    currency: 'NGN' | 'USD';
    features: string[];
    maxStudents: number;
    maxTeachers: number;
    maxStorage: number; // in MB
}

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled' | 'trial';

export interface School {
    id: string; // UUID
    name: string;
    slug: string; // unique URL friendly name
    email: string; // Contact email for the school admin
    logoUrl?: string;
    address?: string;
    phone?: string;
    website?: string;
    subscriptionStatus: SubscriptionStatus;
    createdAt: string;
}

export interface Subscription {
    id: string;
    schoolId: string;
    planId: number;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    trialEndsAt?: string;
    autoRenew: boolean;
    paymentMethod?: 'Paystack' | 'Flutterwave';
}

export interface PaymentDetails {
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    // For Paystack/Flutterwave, we usually just need email and reference
    email: string;
    amount: number;
    reference: string;
}
