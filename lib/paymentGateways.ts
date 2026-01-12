/**
 * Payment Gateway Integration Utility
 * Handles initialization and verification for Paystack and Flutterwave.
 * Requires VITE_PAYSTACK_PUBLIC_KEY and VITE_FLUTTERWAVE_PUBLIC_KEY.
 */

interface PaymentConfig {
    email: string;
    amount: number;
    currency: string;
    reference: string;
    metadata?: any;
    callback_url: string;
}

export const initializePaystackPayment = (config: PaymentConfig) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
        throw new Error('Paystack public key is missing');
    }

    // @ts-ignore
    const handler = window.PaystackPop.setup({
        key: publicKey,
        email: config.email,
        amount: Math.round(config.amount * 100), // Paystack takes amount in kobo/cents
        currency: config.currency,
        ref: config.reference,
        metadata: config.metadata,
        callback: (response: any) => {
            window.location.href = `${config.callback_url}?reference=${response.reference}&gateway=paystack`;
        },
        onClose: () => {
            console.log('Payment modal closed');
        }
    });

    handler.openIframe();
};

export const initializeFlutterwavePayment = (config: PaymentConfig) => {
    const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;

    if (!publicKey) {
        throw new Error('Flutterwave public key is missing');
    }

    // @ts-ignore
    window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: config.reference,
        amount: config.amount,
        currency: config.currency,
        payment_options: "card, account, ussd, qr",
        redirect_url: config.callback_url,
        meta: config.metadata,
        customer: {
            email: config.email,
        },
        customizations: {
            title: "School Management System",
            description: "Subscription Payment",
            logo: "https://your-school-app-logo.com/logo.png",
        },
    });
};

/**
 * Verification helpers (simulated for client-side)
 * In production, these should be verified on the server via webhook.
 */
export const verifyPayment = async (reference: string, gateway: 'paystack' | 'flutterwave') => {
    // In a real app, you would call your Edge Function here to verify with the gateway API
    // and then update the 'payments' table in Supabase.

    console.log(`Verifying ${gateway} payment with reference: ${reference}`);

    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'success', reference });
        }, 1500);
    });
};
