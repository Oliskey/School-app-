
// Follows Supabase Edge Function Deno pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const payload = await req.json();
        const event = payload.event; // e.g. 'charge.success' (Paystack)
        const data = payload.data;

        console.log("Received Webhook:", event);

        // Basic Validation for Paystack/Flutterwave
        // Note: In production you MUST verify the signature header (x-paystack-signature)

        if (event === 'charge.success' || payload.status === 'successful') {
            const email = data.customer.email;
            const amount = data.amount;
            const metadata = data.metadata || {};
            const schoolId = metadata.school_id; // Expect frontend to pass this

            if (schoolId) {
                // Update Subscription
                const { error } = await supabaseClient
                    .from('schools')
                    .update({
                        subscription_status: 'active',
                        plan_id: metadata.plan_id || 'basic', // Default or from metadata
                        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
                    })
                    .eq('id', schoolId);

                if (error) throw error;

                // Log Payment
                await supabaseClient.from('payments_log').insert({
                    school_id: schoolId,
                    amount: amount,
                    provider: 'paystack', // or dynamic
                    status: 'success',
                    raw_response: payload
                });

                return new Response(JSON.stringify({ message: 'Subscription Updated' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                })
            }
        }

        return new Response(JSON.stringify({ message: 'Event ignored or missing data' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
