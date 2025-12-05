import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';

const prisma = new PrismaClient();

export async function dashboardRoutes(app: FastifyInstance) {
    app.register(async (adminApp: FastifyInstance) => {
        adminApp.addHook('onRequest', authenticate);

        adminApp.get('/api/admin/dashboard', async (req: FastifyRequest, reply: FastifyReply) => {
            const schema = z.object({
                from: z.string().optional(), // YYYY-MM-DD
                to: z.string().optional(),
            });
            const query = schema.parse(req.query);

            const fromDate = query.from ? new Date(query.from) : new Date(new Date().setDate(new Date().getDate() - 30));
            const toDate = query.to ? new Date(query.to) : new Date();

            // Metrics
            const totalOrders = await prisma.order.count({
                where: { created_at: { gte: fromDate, lte: toDate } },
            });

            const revenueAgg = await prisma.order.aggregate({
                _sum: { total: true },
                _avg: { total: true },
                where: { created_at: { gte: fromDate, lte: toDate } },
            });

            // Top Fillings (Recheios)
            const topFillings = await prisma.$queryRaw`
        SELECT items->>'name' as name, COUNT(*) as qty
        FROM orders, jsonb_array_elements(items) AS items
        WHERE items->>'type' = 'RECHEIO' AND created_at BETWEEN ${fromDate} AND ${toDate}
        GROUP BY name
        ORDER BY qty DESC
        LIMIT 5;
      `;

            // Orders per day
            const ordersPerDay = await prisma.$queryRaw`
        SELECT date_trunc('day', created_at) AS day, COUNT(*) as total
        FROM orders
        WHERE created_at BETWEEN ${fromDate} AND ${toDate}
        GROUP BY day ORDER BY day;
      `;

            return {
                totalOrders,
                revenue: revenueAgg._sum.total || 0,
                avgTicket: revenueAgg._avg.total || 0,
                topFillings,
                ordersPerDay,
            };
        });
    });
}
