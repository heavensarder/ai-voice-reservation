'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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
    (await cookies()).set('admin_session', 'true', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });

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
