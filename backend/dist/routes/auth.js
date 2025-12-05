"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const prisma = new client_1.PrismaClient();
async function authRoutes(app) {
    app.post('/login', async (req, reply) => {
        const schema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string(),
        });
        const body = schema.safeParse(req.body);
        if (!body.success)
            return reply.status(400).send(body.error);
        const user = await prisma.user.findUnique({ where: { email: body.data.email } });
        if (!user)
            return reply.status(401).send({ message: 'Invalid credentials' });
        const valid = await (0, hash_1.verifyPassword)(body.data.password, user.password_hash);
        if (!valid)
            return reply.status(401).send({ message: 'Invalid credentials' });
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
    app.post('/refresh', async (req, reply) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return reply.status(401).send({ message: 'No refresh token' });
        try {
            const decoded = app.jwt.verify(refreshToken);
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user)
                return reply.status(401).send({ message: 'User not found' });
            const accessToken = app.jwt.sign({ id: user.id, role: user.role }, { expiresIn: '15m' });
            return { accessToken };
        }
        catch (err) {
            return reply.status(401).send({ message: 'Invalid refresh token' });
        }
    });
    app.post('/logout', async (req, reply) => {
        reply.clearCookie('refreshToken');
        return { message: 'Logged out' };
    });
}
