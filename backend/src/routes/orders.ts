import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';

const prisma = new PrismaClient();

export async function ordersRoutes(app: FastifyInstance) {
    // Public route to create an order
    app.post('/api/orders', async (req: FastifyRequest, reply: FastifyReply) => {
        const schema = z.object({
            customer_name: z.string(),
            customer_phone: z.string(),
            items: z.array(z.any()),
            total: z.number(),
        });

        const body = schema.parse(req.body);

        const order = await prisma.order.create({
            data: {
                customer_name: body.customer_name,
                customer_phone: body.customer_phone,
                items: body.items,
                total: body.total,
                status: 'NEW',
            },
        });

        return order;
    });

    // Admin routes
    app.register(async (adminApp: FastifyInstance) => {
        adminApp.addHook('onRequest', authenticate);

        adminApp.get('/api/admin/orders', async (req: FastifyRequest, reply: FastifyReply) => {
            const schema = z.object({
                status: z.enum(['NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
                page: z.string().transform(Number).default('1'),
                limit: z.string().transform(Number).default('10'),
            });
            const query = schema.parse(req.query);
            const skip = (query.page - 1) * query.limit;

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where: query.status ? { status: query.status } : undefined,
                    orderBy: { created_at: 'desc' },
                    skip,
                    take: query.limit,
                }),
                prisma.order.count({ where: query.status ? { status: query.status } : undefined }),
            ]);

            return { orders, total, page: query.page, pages: Math.ceil(total / query.limit) };
        });

        adminApp.get('/api/admin/orders/:id', async (req: FastifyRequest, reply: FastifyReply) => {
            const paramsSchema = z.object({ id: z.string() });
            const { id } = paramsSchema.parse(req.params);
            const order = await prisma.order.findUnique({ where: { id } });
            return order;
        });

        adminApp.put('/api/admin/orders/:id', async (req: FastifyRequest, reply: FastifyReply) => {
            const paramsSchema = z.object({ id: z.string() });
            const { id } = paramsSchema.parse(req.params);

            const bodySchema = z.object({
                status: z.enum(['NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
                assigned_to: z.string().optional(),
            });
            const body = bodySchema.parse(req.body);

            const order = await prisma.order.update({
                where: { id },
                data: body,
            });
            return order;
        });
    });
}
