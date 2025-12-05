import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../utils/hash';

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
    app.post('/login', async (req: FastifyRequest, reply: FastifyReply) => {
        const schema = z.object({
            email: z.string().email(),
            password: z.string(),
        });

        const body = schema.safeParse(req.body);
        if (!body.success) return reply.status(400).send(body.error);

        const user = await prisma.user.findUnique({ where: { email: body.data.email } });
        if (!user) return reply.status(401).send({ message: 'Invalid credentials' });

        const valid = await verifyPassword(body.data.password, user.password_hash);
        if (!valid) return reply.status(401).send({ message: 'Invalid credentials' });

        const accessToken = app.jwt.sign({ id: user.id, role: user.role }, { expiresIn: '15m' });
        const refreshToken = app.jwt.sign({ id: user.id }, { expiresIn: '7d' });

        reply.setCookie('refreshToken', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return { accessToken };
    });

    app.post('/refresh', async (req: FastifyRequest, reply: FastifyReply) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return reply.status(401).send({ message: 'No refresh token' });

        try {
            const decoded = app.jwt.verify<{ id: string }>(refreshToken);
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) return reply.status(401).send({ message: 'User not found' });

            const accessToken = app.jwt.sign({ id: user.id, role: user.role }, { expiresIn: '15m' });
            return { accessToken };
        } catch (err) {
            return reply.status(401).send({ message: 'Invalid refresh token' });
        }
    });

    app.post('/logout', async (req: FastifyRequest, reply: FastifyReply) => {
        reply.clearCookie('refreshToken');
        return { message: 'Logged out' };
    });
}
