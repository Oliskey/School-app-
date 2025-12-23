
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatRoom } from '../../types';
import { supabase } from '../../lib/supabase';
import { SendIcon, PaperclipIcon, HappyIcon, DotsVerticalIcon } from '../../constants';

interface ChatScreenProps {
    conversationId?: number; // Provided by new logic
    conversation?: any; // Legacy specific mock object support (deprecated)
    roomDetails?: any; // Passed from navigation
    currentUserId: number;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId, conversation, roomDetails, currentUserId }) => {
    // If conversationId is missing but conversation object exists, try to fallback (mock data scenario), else use ID.
    // In our new flow, conversationId is passed.
    const roomId = conversationId || (conversation?.id ? parseInt(conversation.id) : null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Fetch
    useEffect(() => {
        if (!roomId) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
                    *,
                    sender:users!sender_id (id, name, avatar_url, role)
                `)
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (data) {
                // Map DB columns to frontend type if necessary, though we aligned types closely
                const mappedMessages = data.map((msg: any) => ({
                    id: msg.id,
                    roomId: msg.room_id,
                    senderId: msg.sender_id,
                    content: msg.content,
                    type: msg.type,
                    mediaUrl: msg.media_url,
                    fileName: msg.file_name,
                    fileSize: msg.file_size,
                    replyToId: msg.reply_to_id,
                    isDeleted: msg.is_deleted,
                    isEdited: msg.is_edited,
                    createdAt: msg.created_at,
                    updatedAt: msg.updated_at,
                    sender: msg.sender ? {
                        id: msg.sender.id,
                        name: msg.sender.name,
                        avatarUrl: msg.sender.avatar_url,
                        role: msg.sender.role || 'Member'
                    } : undefined
                }));
                setMessages(mappedMessages);
            }
            setLoading(false);
        };

        fetchMessages();
    }, [roomId]);

    // Real-time Subscription
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase.channel(`room:${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`
            }, async (payload) => {
                const newMsg = payload.new;
                // Fetch sender info for the new message
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, name, avatar_url, role')
                    .eq('id', newMsg.sender_id)
                    .single();

                const formattedMsg: ChatMessage = {
                    id: newMsg.id,
                    roomId: newMsg.room_id,
                    senderId: newMsg.sender_id,
                    content: newMsg.content,
                    type: newMsg.type,
                    mediaUrl: newMsg.media_url,
                    fileName: newMsg.file_name,
                    fileSize: newMsg.file_size,
                    replyToId: newMsg.reply_to_id,
                    isDeleted: newMsg.is_deleted,
                    isEdited: newMsg.is_edited,
                    createdAt: newMsg.created_at,
                    updatedAt: newMsg.updated_at,
                    sender: userData ? {
                        id: userData.id,
                        name: userData.name,
                        avatarUrl: userData.avatar_url,
                        role: userData.role || 'Member'
                    } : undefined
                };

                setMessages(prev => [...prev, formattedMsg]);
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.userId !== currentUserId) {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        if (payload.payload.isTyping) {
                            newSet.add(payload.payload.userId);
                        } else {
                            newSet.delete(payload.payload.userId);
                        }
                        return newSet;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, currentUserId]);

    // Auto-scroll and Mark as Read
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });

        const markAsRead = async () => {
            if (messages.length > 0 && roomId) {
                const lastMsg = messages[messages.length - 1];
                if (lastMsg.id) {
                    await supabase
                        .from('chat_participants')
                        .update({ last_read_message_id: lastMsg.id })
                        .eq('room_id', roomId)
                        .eq('user_id', currentUserId);
                }
            }
        };

        markAsRead();
    }, [messages, roomId, currentUserId, typingUsers]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim() === '' || !roomId) return;

        const textToSend = inputText.trim();
        setInputText(''); // Optimistic clear

        // 1. Insert into DB
        const { error } = await supabase
            .from('chat_messages')
            .insert({
                room_id: roomId,
                sender_id: currentUserId,
                content: textToSend,
                type: 'text'
            });

        if (error) {
            console.error('Error sending message:', error);
            // Ideally show toast
            setInputText(textToSend); // Revert on failure
            return;
        }

        // 2. Update room's last_message_at
        await supabase
            .from('chat_rooms')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', roomId);

        // Stop typing
        handleTyping(false);
    };

    const handleTyping = async (isTypingNow: boolean) => {
        if (!roomId) return;

        await supabase.channel(`room:${roomId}`).send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: currentUserId, isTyping: isTypingNow }
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);

        if (!isTyping) {
            setIsTyping(true);
            handleTyping(true);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            handleTyping(false);
        }, 2000);
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center text-gray-500 bg-[#efeae2]">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full mb-3"></div>
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
        </div>;
    }

    if (!roomId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#fdfdfd] border-l border-gray-100">
                <div className="w-24 h-24 bg-orange-100/50 rounded-full flex items-center justify-center mb-6">
                    <SendIcon className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your Messages</h3>
                <p className="text-gray-500 max-w-xs">Select a conversation from the list or start a new chat to begin messaging.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full relative bg-[#efeae2]">
            {/* Header - Only show if we need context, but in split view the sidebar has context. 
                 However, on mobile pushing to this view might need a header? 
                 Actually StudentDashboard provides header. So we just need the content.
                 BUT, for the Chat Area itself, seeing who we are talking to is nice.
             */}
            {/* We can do a mini-header inside the chat pane for the contact info */}
            <div className="bg-white/90 backdrop-blur-sm p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-3">
                    {/* If we had room details passed, we could show avatar here. 
                        We don't always have it in props, but we can try to find the 'other' participant from messages?
                        Better: Pass roomDetails properly.
                    */}
                    {roomDetails?.displayAvatar && (
                        <img src={roomDetails.displayAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                    )}
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">{roomDetails?.displayName || 'Chat'}</h3>
                        {/* Optional status text */}
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <DotsVerticalIcon />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar" style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {messages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    const isSequence = index > 0 && messages[index - 1].senderId === msg.senderId;

                    return (
                        <div key={msg.id || index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isSequence ? 'mt-1' : 'mt-4'} group`}>
                            {!isCurrentUser && !isSequence && (
                                <div className="w-8 h-8 mr-2 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 self-end mb-1 shadow-sm border border-white">
                                    {msg.sender?.avatarUrl ? (
                                        <img src={msg.sender.avatarUrl} className="w-full h-full object-cover" alt={msg.sender.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">?</div>
                                    )}
                                </div>
                            )}
                            {!isCurrentUser && isSequence && <div className="w-8 mr-2 flex-shrink-0" />}

                            <div className={`max-w-[80%] md:max-w-[65%] px-4 py-2.5 shadow-sm relative text-sm ${isCurrentUser
                                    ? 'bg-orange-500 text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm'
                                }`}>

                                {!isCurrentUser && !isSequence && msg.sender?.name && (
                                    <p className="text-[11px] font-bold text-orange-600 mb-1 opacity-90">{msg.sender.name}</p>
                                )}

                                {msg.type === 'text' && (
                                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                )}

                                <div className={`flex items-end gap-1 mt-1 ${isCurrentUser ? 'justify-end text-orange-100' : 'justify-end text-gray-400'}`}>
                                    <span className="text-[10px] leading-none opacity-80">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {typingUsers.size > 0 && (
                    <div className="flex items-center space-x-2 ml-12 mt-2">
                        <div className="flex space-x-1 bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}

                <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 max-w-5xl mx-auto">
                    <button type="button" className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <HappyIcon className="w-6 h-6" />
                    </button>
                    <button type="button" className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-grow bg-gray-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-orange-100 focus-within:bg-white transition-all border border-transparent focus-within:border-orange-200">
                        <input
                            type="text"
                            value={inputText}
                            onChange={onInputChange}
                            placeholder="Type a message..."
                            className="flex-grow bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 h-full py-1 text-sm sm:text-base outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className={`p-3 rounded-full shadow-md text-white transition-all transform ${inputText.trim()
                                ? 'bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-orange-200'
                                : 'bg-gray-200 cursor-not-allowed'
                            }`}
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatScreen;
