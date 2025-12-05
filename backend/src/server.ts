import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

const server = Fastify({
    logger: true
});

server.register(cors, {
    origin: true, // Adjust for production
    credentials: true
});

server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});

server.register(cookie);

server.get('/health', async () => {
    return { status: 'ok' };
});

import { authRoutes } from './routes/auth';
import { optionsRoutes } from './routes/options';
import { ordersRoutes } from './routes/orders';
import { dashboardRoutes } from './routes/dashboard';

server.register(authRoutes, { prefix: '/api/admin' });
server.register(optionsRoutes);
server.register(ordersRoutes);
server.register(dashboardRoutes);

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
