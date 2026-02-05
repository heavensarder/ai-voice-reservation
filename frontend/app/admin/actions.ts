'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface LoginState {
    error?: string;
    success?: boolean;
}

const prisma = new PrismaClient();

export async function loginAdmin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password required' };
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return { error: 'Invalid credentials' };
    }

    // Set session cookie
    // In production, use a signed JWT or session token.
    // For this task, we'll store a simple secure flag. 
    // NOTE: Simple cookie for demonstration.
    (await cookies()).set('admin_session', 'true', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        path: '/', 
        maxAge: 86400 
    });

    return { success: true };
}

export async function logoutAdmin() {
    (await cookies()).delete('admin_session');
}

export async function updateConfig(prevState: any, formData: FormData) {
    const openaiKey = formData.get('OPENAI_API_KEY') as string;
    const googleCreds = formData.get('GOOGLE_TTS_CREDENTIALS') as string;

    try {
        if (openaiKey) {
            await prisma.systemConfig.upsert({
                where: { key: 'OPENAI_API_KEY' },
                update: { value: openaiKey },
                create: { key: 'OPENAI_API_KEY', value: openaiKey }
            });
        }

        if (googleCreds) {
            await prisma.systemConfig.upsert({
                where: { key: 'GOOGLE_TTS_CREDENTIALS' },
                update: { value: googleCreds },
                create: { key: 'GOOGLE_TTS_CREDENTIALS', value: googleCreds }
            });
        }

        const systemPrompt = formData.get('SYSTEM_PROMPT') as string;
        if (systemPrompt) {
            await prisma.systemConfig.upsert({
                where: { key: 'SYSTEM_PROMPT' },
                update: { value: systemPrompt },
                create: { key: 'SYSTEM_PROMPT', value: systemPrompt }
            });
        }

        revalidatePath('/admin/settings');
        return { success: true, message: 'Configuration Updated' };
    } catch (error) {
        return { error: 'Failed to update config' };
    }
}

export async function getConfig() {
    // Check auth
    if (!(await cookies()).get('admin_session')) return null;

    const configs = await prisma.systemConfig.findMany();
    const configMap: Record<string, string> = {};
    configs.forEach(c => configMap[c.key] = c.value);
    return configMap;
}

export async function verifyAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
    if (!password) {
        return { success: false, error: 'Password required' };
    }

    // Get the first admin (assuming single admin)
    const admin = await prisma.admin.findFirst();

    if (!admin) {
        return { success: false, error: 'No admin found' };
    }

    const isValid = bcrypt.compareSync(password, admin.password);

    if (!isValid) {
        return { success: false, error: 'Invalid password' };
    }

    return { success: true };
}

export async function getAdminProfile() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
        return null;
    }

    // Since we are using a simple cookie for this demo, we'll fetch the first admin.
    // In a real app, you'd decode the token to get the user ID.
    const admin = await prisma.admin.findFirst({
        select: {
            email: true,
            id: true
        }
    });

    return admin;
}
