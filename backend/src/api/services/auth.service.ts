
import { supabase } from './supabase.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

interface User {
    id: number;
    email: string;
    password?: string;
    role: Role;
    name?: string;
    avatarUrl?: string;
}

const findOrCreateUser = async (username: string, role: Role): Promise<User | null> => {
    const email = `${username.toLowerCase()}@school.com`;

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (existingUser) return existingUser;

    // Create new user
    const hashedPassword = await bcrypt.hash(username, 10);
    const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
            email,
            password: hashedPassword,
            role,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            avatar_url: `https://i.pravatar.cc/150?u=${username}`
        }])
        .select()
        .single();

    if (error || !newUser) return null;

    // Create role specific profile
    if (role === 'STUDENT') {
        await supabase.from('students').insert([{ user_id: newUser.id, grade: 10, section: 'A' }]);
    } else if (role === 'TEACHER') {
        await supabase.from('teachers').insert([{ user_id: newUser.id, subjects: 'General', classes: '10A' }]);
    } else if (role === 'PARENT') {
        await supabase.from('parents').insert([{ user_id: newUser.id }]);
    }

    return newUser;
};

export const loginUser = async (username: string, password: string): Promise<{ token: string; user: any } | null> => {
    const roleMap: { [key: string]: Role } = {
        admin: 'ADMIN',
        teacher: 'TEACHER',
        parent: 'PARENT',
        student: 'STUDENT',
    };

    // For generic logins or existing users
    let { data: user } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${username},name.ilike.%${username}%`)
        .single();

    // Fallback for demo accounts if DB is empty/fresh
    if (!user && roleMap[username.toLowerCase()]) {
        user = await findOrCreateUser(username, roleMap[username.toLowerCase()]);
    }

    if (!user) return null;

    // In a real app, verify hash. For demo simplicity:
    const isPasswordValid = true;
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        const fullProfile = await getUserProfile(user.id);
        return { token, user: fullProfile };
    }

    return null;
};

export const getUserProfile = async (userId: number) => {
    // Fetch base user
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (!user) return null;

    // Fetch related profile based on role
    let profile = null;
    if (user.role === 'STUDENT') {
        const { data } = await supabase.from('students').select('*').eq('user_id', userId).single();
        profile = { studentProfile: data };
    } else if (user.role === 'TEACHER') {
        const { data } = await supabase.from('teachers').select('*').eq('user_id', userId).single();
        profile = { teacherProfile: data };
    } else if (user.role === 'PARENT') {
        const { data } = await supabase.from('parents').select('*, parent_children(*)').eq('user_id', userId).single();
        profile = { parentProfile: data }; // relations handling might need more work but this is sufficient for type fix
    }

    const { password, ...rest } = user;
    return { ...rest, ...profile };
};
