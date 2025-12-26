import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type NotificationCallback = (payload: any) => void;

class RealtimeService {
    private channels: RealtimeChannel[] = [];
    private static instance: RealtimeService;

    private constructor() { }

    public static getInstance(): RealtimeService {
        if (!RealtimeService.instance) {
            RealtimeService.instance = new RealtimeService();
        }
        return RealtimeService.instance;
    }

    /**
     * Subscribe to notifications for a specific user
     * @param userId The ID of the user (can be string UUID or number)
     * @param onNotification Callback function when a notification is received
     */
    public subscribeToNotifications(userId: string | number, onNotification: NotificationCallback) {
        // Note: In Postgres, row level security usually filters this, 
        // but we can also filter by column in the channel subscription if valid
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New notification received:', payload);
                    onNotification(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to notifications for user ${userId}`);
                }
            });

        this.channels.push(channel);
        return channel;
    }

    /**
     * Subscribe to global announcements
     */
    public subscribeToAnnouncements(onAnnouncement: NotificationCallback) {
        const channel = supabase
            .channel('global_announcements')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'announcements' // Assuming there is an announcements table
                },
                (payload) => {
                    onAnnouncement(payload.new);
                }
            )
            .subscribe();

        this.channels.push(channel);
        return channel;
    }

    // Note: For chat specifically, we often need to subscribe to specific rooms.
    // We'll leave that to a specialized ChatService or expand this later.
    // For now, we rely on the 'notifications' table for high-level alerts.

    public unsubscribeAll() {
        this.channels.forEach(channel => {
            supabase.removeChannel(channel);
        });
        this.channels = [];
    }
}

export const realtimeService = RealtimeService.getInstance();
