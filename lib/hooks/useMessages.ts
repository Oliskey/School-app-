import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { ChatMessage } from '../../types';
import { mockConversations } from '../../data';

export interface UseMessagesResult {
    messages: ChatMessage[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    sendMessage: (message: Partial<ChatMessage>) => Promise<ChatMessage | null>;
}

export function useMessages(roomId: number): UseMessagesResult {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!isSupabaseConfigured || !roomId) {
            // Find mock messages for the room
            const conversation = mockConversations.find(c => c.id === roomId);
            setMessages(conversation?.lastMessage ? [conversation.lastMessage] : []);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            const transformedMessages: ChatMessage[] = (data || []).map(transformSupabaseMessage);

            setMessages(transformedMessages);
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        fetchMessages();

        if (!isSupabaseConfigured || !roomId) return;

        const channel = supabase
            .channel(`messages-room-${roomId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
                (payload) => {
                    console.log('Message change detected:', payload);
                    fetchMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchMessages, roomId]);

    const sendMessage = async (messageData: Partial<ChatMessage>): Promise<ChatMessage | null> => {
        if (!isSupabaseConfigured) {
            console.warn('Supabase not configured, cannot send message');
            return null;
        }

        try {
            const { data, error: insertError } = await supabase
                .from('chat_messages')
                .insert([{
                    room_id: roomId,
                    sender_id: messageData.senderId,
                    content: messageData.content,
                    type: messageData.type,
                    media_url: messageData.mediaUrl,
                    file_name: messageData.fileName,
                    file_size: messageData.fileSize,
                    reply_to_id: messageData.replyToId,
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            return transformSupabaseMessage(data);
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err as Error);
            return null;
        }
    };

    return {
        messages,
        loading,
        error,
        refetch: fetchMessages,
        sendMessage,
    };
}

const transformSupabaseMessage = (m: any): ChatMessage => ({
    id: m.id,
    roomId: m.room_id,
    senderId: m.sender_id,
    content: m.content,
    type: m.type,
    mediaUrl: m.media_url,
    fileName: m.file_name,
    fileSize: m.file_size,
    replyToId: m.reply_to_id,
    isDeleted: m.is_deleted,
    isEdited: m.is_edited,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
});
