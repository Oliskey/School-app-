
import React from 'react';
import { HomeIcon, BellIcon, UserIcon as ProfileIcon, DocumentTextIcon, PhoneIcon, PlayIcon, AnalyticsIcon, MegaphoneIcon, SettingsIcon, MessagesIcon, ElearningIcon, SparklesIcon, UserGroupIcon, GameControllerIcon, ChartBarIcon } from '../../constants';

interface SideNavItemProps {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
    activeColor: string;
}

const SideNavItem: React.FC<SideNavItemProps> = ({ icon, label, isActive, onClick, activeColor }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gray-100 ' + activeColor : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
    >
        <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
            {React.cloneElement(icon, { className: `h-6 w-6` })}
        </div>
        <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
);

export const AdminSideNav = ({ activeScreen, setActiveScreen }: { activeScreen: string, setActiveScreen: (screen: string) => void }) => {
    const navItems = [
        { id: 'home', icon: <HomeIcon />, label: 'Home' },
        { id: 'messages', icon: <MessagesIcon />, label: 'Messages' },
        { id: 'communication', icon: <MegaphoneIcon />, label: 'Announce' },
        { id: 'analytics', icon: <AnalyticsIcon className="h-6 w-6" />, label: 'Analytics' },
        { id: 'settings', icon: <SettingsIcon />, label: 'Settings' },
    ];
    return (
        <div className="hidden lg:flex flex-col w-64 h-full bg-white border-r border-gray-200 p-4 space-y-2">
            <div className="mb-6 px-4 pt-2">
                <h2 className="text-xl font-bold text-gray-800">Admin</h2>
            </div>
            {navItems.map(item => (
                <SideNavItem key={item.id} icon={item.icon} label={item.label} isActive={activeScreen === item.id} onClick={() => setActiveScreen(item.id)} activeColor="text-indigo-600" />
            ))}
        </div>
    );
};

export const TeacherSideNav = ({ activeScreen, setActiveScreen }: { activeScreen: string, setActiveScreen: (screen: string) => void }) => {
    const navItems = [
        { id: 'home', icon: <HomeIcon />, label: 'Home' },
        { id: 'reports', icon: <DocumentTextIcon />, label: 'Reports' },
        { id: 'forum', icon: <UserGroupIcon />, label: 'Forum' },
        { id: 'messages', icon: <MessagesIcon />, label: 'Messages' },
        { id: 'settings', icon: <SettingsIcon />, label: 'Settings' },
    ];
    return (
        <div className="hidden lg:flex flex-col w-64 h-full bg-white border-r border-gray-200 p-4 space-y-2">
            <div className="mb-6 px-4 pt-2">
                <h2 className="text-xl font-bold text-gray-800">Teacher</h2>
            </div>
            {navItems.map(item => (
                <SideNavItem key={item.id} icon={item.icon} label={item.label} isActive={activeScreen === item.id} onClick={() => setActiveScreen(item.id)} activeColor="text-[#7B61FF]" />
            ))}
        </div>
    );
};

export const ParentSideNav = ({ activeScreen, setActiveScreen }: { activeScreen: string, setActiveScreen: (screen: string) => void }) => {
    const navItems = [
        { id: 'home', icon: <HomeIcon />, label: 'Home' },
        { id: 'reports', icon: <DocumentTextIcon />, label: 'Reports' },
        { id: 'messages', icon: <MessagesIcon />, label: 'Messages' },
        { id: 'more', icon: <ProfileIcon />, label: 'More' },
    ];
    return (
        <div className="hidden lg:flex flex-col w-64 h-full bg-white border-r border-gray-200 p-4 space-y-2">
            <div className="mb-6 px-4 pt-2">
                <h2 className="text-xl font-bold text-gray-800">Parent</h2>
            </div>
            {navItems.map(item => (
                <SideNavItem key={item.id} icon={item.icon} label={item.label} isActive={activeScreen === item.id} onClick={() => setActiveScreen(item.id)} activeColor="text-[#4CAF50]" />
            ))}
        </div>
    );
};

export const StudentSideNav = ({ activeScreen, setActiveScreen }: { activeScreen: string, setActiveScreen: (screen: string) => void }) => {
    const navItems = [
        { id: 'home', icon: <HomeIcon />, label: 'Home' },
        { id: 'results', icon: <ChartBarIcon />, label: 'Results' },
        { id: 'games', icon: <GameControllerIcon />, label: 'Games' },
        { id: 'messages', icon: <MessagesIcon />, label: 'Messages' },
        { id: 'profile', icon: <ProfileIcon />, label: 'Profile' },
    ];
    return (
        <div className="hidden lg:flex flex-col w-64 h-full bg-white border-r border-gray-200 p-4 space-y-2">
            <div className="mb-6 px-4 pt-2">
                <h2 className="text-xl font-bold text-gray-800">Student</h2>
            </div>
            {navItems.map(item => (
                <SideNavItem key={item.id} icon={item.icon} label={item.label} isActive={activeScreen === item.id} onClick={() => setActiveScreen(item.id)} activeColor="text-[#FF9800]" />
            ))}
        </div>
    );
};
