const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@mediasoftbd.com';
    const password = 'Mediasoft2026@#';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
        },
    });

    console.log({ admin });

    // Seed initial config keys if not exist
    await prisma.systemConfig.upsert({
        where: { key: 'OPENAI_API_KEY' },
        update: {},
        create: { key: 'OPENAI_API_KEY', value: '' }
    });

    await prisma.systemConfig.upsert({
        where: { key: 'GOOGLE_TTS_CREDENTIALS' },
        update: {},
        create: { key: 'GOOGLE_TTS_CREDENTIALS', value: '' }
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
