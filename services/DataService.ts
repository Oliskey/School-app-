
import { supabase } from '../lib/supabase';
import { offlineStorage } from '../lib/offlineStorage';
import { DashboardType } from '../types';

export const DataService = {
    /**
     * Fetch the user's profile and role data securely.
     */
    async getUserProfile(userId: string, email: string) {
        // 1. Check offline cache first (if relevant strategy)
        // 2. Fetch from 'users' or 'profiles'
        // This unifies the logic scattered in App.tsx and dashboards
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return profile;
        } catch (err) {
            console.error("DataService: Error fetching profile", err);
            return null;
        }
    },

    /**
     * Fetch School Subscription Status
     */
    async getSchoolSubscription(schoolId: string) {
        try {
            const { data: school, error } = await supabase
                .from('schools')
                .select('subscription_status, plan_id')
                .eq('id', schoolId)
                .single();

            if (error) throw error;
            return school?.subscription_status || 'inactive';
        } catch (err) {
            console.error("DataService: Error fetching subscription", err);
            // Fail secure - inactive
            return 'inactive';
        }
    },

    /**
     * Verify if a user exists in the `users` table (Legacy/Central Registry)
     */
    async verifyUserExists(email: string) {
        const { data } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', email)
            .maybeSingle();
        return data;
    },

    /**
     * Sync important data for offline usage
     */
    async syncOfflineData(userId: string, role: DashboardType) {
        // Placeholder for background sync logic
        console.log(`Syncing data for ${role}...`);
    }
};
