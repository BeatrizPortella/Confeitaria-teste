import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password_hash: passwordHash,
            role: 'ADMIN',
        },
    });

    console.log({ admin });

    // Create some initial options
    await prisma.option.createMany({
        data: [
            { type: 'RECHEIO', name: 'Brigadeiro', slug: 'brigadeiro', price: 0, order: 1 },
            { type: 'RECHEIO', name: 'Ninho', slug: 'ninho', price: 5.00, order: 2 },
            { type: 'MASSA', name: 'Baunilha', slug: 'baunilha', price: 0, order: 1 },
            { type: 'MASSA', name: 'Chocolate', slug: 'chocolate', price: 0, order: 2 },
        ],
        skipDuplicates: true,
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
