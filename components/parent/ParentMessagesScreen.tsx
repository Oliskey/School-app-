import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SearchIcon, PlusIcon, DotsVerticalIcon } from '../../constants';

const formatTimestamp = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (date >= startOfToday) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (date >= startOfYesterday) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-GB');
    }
};

interface ParentMessagesScreenProps {
    navigateTo?: (view: string, title: string, props?: any) => void;
    parentId?: number | null;
    onSelectChat?: (conversation: any) => void;
}

const ParentMessagesScreen: React.FC<ParentMessagesScreenProps> = ({ navigateTo, parentId, onSelectChat }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'All' | 'Unread'>('All');
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Responsive state
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchRooms = async () => {
            if (!parentId) {
                return;
            }

            try {
                // 1. Get rooms I am in
                const { data: myParticipations, error: partError } = await supabase
                    .from('chat_participants')
                    .select('room_id, last_read_message_id')
                    .eq('user_id', parentId);

                if (partError || !myParticipations) {
                    console.error('Error fetching participations:', partError);
                    return;
                }

                const participationsMap = new Map(myParticipations.map(p => [p.room_id, p]));
                const roomIds = myParticipations.map(p => p.room_id);
                if (roomIds.length === 0) {
                    setRooms([]);
                    setLoading(false);
                    return;
                }

                // 2. Get room details, including last message (via sorting messages)
                const { data: roomsData, error: roomsError } = await supabase
                    .from('chat_rooms')
                    .select(`
                        id, type, name, is_group, last_message_at, updated_at, created_at
                    `)
                    .in('id', roomIds)
                    .order('last_message_at', { ascending: false });

                if (roomsError) {
                    console.error('Error fetching rooms:', roomsError);
                    setLoading(false);
                    return;
                }

                // 3. For each room, get participants (to find the other person in direct chats) AND last message
                const enrichedRooms = await Promise.all(roomsData.map(async (room) => {
                    const { data: participants } = await supabase
                        .from('chat_participants')
                        .select(`
                            user_id,
                            role,
                            users ( id, name, avatar_url, role )
                        `)
                        .eq('room_id', room.id);

                    const { data: lastMsg } = await supabase
                        .from('chat_messages')
                        .select('content, created_at, type, sender_id, id')
                        .eq('room_id', room.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    // Determine name/avatar for display
                    let displayName = room.name;
                    let displayAvatar = '';
                    let otherParticipant = null;

                    if (!room.is_group && participants) {
                        const other: any = participants.find((p: any) => p.user_id !== parentId);
                        if (other) {
                            const userObj = Array.isArray(other.users) ? other.users[0] : other.users;
                            if (userObj) {
                                displayName = userObj.name;
                                displayAvatar = userObj.avatar_url || displayAvatar;
                                otherParticipant = userObj;
                            }
                        }
                        if (!otherParticipant) {
                            // Self chat or error
                            displayName = "Me";
                        }
                    } else {
                        // Group chat avatar logic (optional)
                        displayAvatar = ''; // Or handling group avatar logic differently if needed, but removing external link
                    }

                    return {
                        ...room,
                        participants: participants || [],
                        lastMessage: lastMsg || { id: 0, content: 'No messages yet', created_at: room.created_at, type: 'text' },
                        displayName,
                        displayAvatar,
                        otherParticipant,
                        lastReadMessageId: participationsMap.get(room.id)?.last_read_message_id || 0
                    };
                }));

                setRooms(enrichedRooms);

            } catch (e) {
                console.error('Error loading chats:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();

        // Subscribe to new messages system-wide for now to update list order
        const roomSubscription = supabase
            .channel('public:chat_rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, (payload) => {
                fetchRooms(); // Re-fetch on any update for simplicity
            })
            .subscribe();

        return () => {
            supabase.removeChannel(roomSubscription);
        };

    }, [parentId]);

    const filteredConversations = useMemo(() => {
        return rooms
            .filter(room => {
                const nameMatch = room.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
                if (!nameMatch) return false;

                // Simple unread logic 
                if (activeFilter === 'Unread') {
                    // Check if there are unread messages
                    const hasUnread = room.lastMessage && room.lastMessage.id > room.lastReadMessageId;
                    return hasUnread;
                }
                return true;
            });
    }, [searchTerm, activeFilter, rooms]);

    const handleChatClick = (room: any) => {
        if (onSelectChat) {
            onSelectChat(room);
            return;
        }

        if (isDesktop) {
            setSelectedRoomId(room.id);
            setSelectedRoom(room);
        } else {
            if (navigateTo) {
                navigateTo('chat', room.displayName, { conversationId: room.id, roomDetails: room });
            }
        }
    };

    const handleNewChat = () => {
        navigateTo && navigateTo('newChat', 'New Message', {});
    };

    return (
        <div className="flex h-full bg-white border-r border-gray-200 overflow-hidden">
            {/* Sidebar / List - Full width on mobile, 1/3 on desktop if standalone */}
            <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${isDesktop && !onSelectChat ? 'w-2/5 max-w-sm' : 'w-full'}`}>
                <header className="p-4 bg-gray-50/50 backdrop-blur-md border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Messages</h1>
                        <div className="flex items-center space-x-1">
                            <button onClick={handleNewChat} className="p-2 rounded-full hover:bg-orange-100 text-orange-500 transition-colors" title="New Message">
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="text-gray-400 w-4 h-4" />
                        </span>
                        <input
                            type="search"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm text-gray-700 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all outline-none placeholder-gray-400"
                        />
                    </div>

                    <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                        {(['All', 'Unread', 'Groups'] as const).map(filter => (
                            <button key={filter} onClick={() => setActiveFilter(filter as 'All' | 'Unread')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-gray-800 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}>
                                {filter}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <SearchIcon className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No conversations found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredConversations.map(room => {
                                const ts = room.lastMessage?.created_at || room.updated_at;
                                const hasUnread = room.lastMessage && room.lastMessage.id > room.lastReadMessageId;
                                const isSelected = isDesktop && selectedRoomId === room.id;

                                return (
                                    <button
                                        key={room.id}
                                        onClick={() => handleChatClick(room)}
                                        className={`w-full text-left px-4 py-3 flex items-center space-x-4 transition-all hover:bg-gray-50 active:bg-gray-100 ${isSelected ? 'bg-orange-50/60 border-l-4 border-orange-500' : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {room.displayAvatar ? (
                                                <img src={room.displayAvatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border border-gray-100 shadow-sm text-orange-600 font-bold">
                                                    {room.displayName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            {room.is_group && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                    <div className="bg-indigo-100 rounded-full p-1">
                                                        <SearchIcon className="w-2 h-2 text-indigo-500" /> {/* Placeholder group icon */}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className={`font-bold truncate text-sm text-gray-900 ${hasUnread ? '' : ''}`}>{room.displayName}</h4>
                                                <span className={`text-[10px] flex-shrink-0 ml-2 font-medium ${hasUnread ? 'text-orange-600' : 'text-gray-400'}`}>
                                                    {formatTimestamp(ts)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-xs truncate pr-2 ${hasUnread ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                                    {room.lastMessage?.sender_id === parentId && <span className="text-gray-400 font-normal">You: </span>}
                                                    {room.lastMessage?.content || 'Started a conversation'}
                                                </p>
                                                {hasUnread && (
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 shadow-sm shadow-orange-200"></div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Desktop Only: Chat Area - Only show if standalone (no onSelectChat prop) */}
            {isDesktop && !onSelectChat && (
                <div className="flex-grow h-full bg-gray-50 hidden md:block">
                    <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
                        <ChatScreen
                            conversationId={selectedRoomId!}
                            currentUserId={parentId!}
                            roomDetails={selectedRoom}
                        />
                    </React.Suspense>
                </div>
            )}
        </div>
    );
};

// Lazy load ChatScreen to avoid circular dependencies
const ChatScreen = React.lazy(() => import('../shared/ChatScreen'));

export default ParentMessagesScreen;
