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
     * Subscribe to messages for a user or room
     */
    public subscribeToMessages(roomOrUserId: string | number, onMessage: NotificationCallback) {
        const channel = supabase
            .channel(`chat:${roomOrUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    // Filter could be room_id or receiver_id depending on schema
                },
                (payload) => {
                    onMessage(payload.new);
                }
            )
            .subscribe();

        this.channels.push(channel);
        return channel;
    }

    /**
     * Subscribe to financial transactions (Real-time Payment confirmation)
     */
    public subscribeToTransactions(schoolId: string | number, onUpdate: NotificationCallback) {
        const channel = supabase
            .channel(`payments:${schoolId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Sync all changes (Insert, Update)
                    schema: 'public',
                    table: 'payments',
                    filter: `school_id=eq.${schoolId}`
                },
                (payload) => {
                    onUpdate(payload.new);
                }
            )
            .subscribe();

        this.channels.push(channel);
        return channel;
    }

    /**
     * Generic subscription to any table
     */
    public subscribeToTable(tableName: string, filter: string | null, onEvent: NotificationCallback) {
        const channel = supabase
            .channel(`sync:${tableName}:${filter || 'all'}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: tableName,
                    ...(filter ? { filter } : {})
                },
                (payload) => {
                    onEvent(payload.new);
                }
            )
            .subscribe();

        this.channels.push(channel);
        return channel;
    }

    public unsubscribeAll() {
        this.channels.forEach(channel => {
            supabase.removeChannel(channel);
        });
        this.channels = [];
    }
}

export const realtimeService = RealtimeService.getInstance();
