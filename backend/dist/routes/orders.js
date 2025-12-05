"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRoutes = ordersRoutes;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const prisma = new client_1.PrismaClient();
async function ordersRoutes(app) {
    // Public route to create an order
    app.post('/api/orders', async (req, reply) => {
        const schema = zod_1.z.object({
            customer_name: zod_1.z.string(),
            customer_phone: zod_1.z.string(),
            items: zod_1.z.array(zod_1.z.any()),
            total: zod_1.z.number(),
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
    app.register(async (adminApp) => {
        adminApp.addHook('onRequest', auth_1.authenticate);
        adminApp.get('/api/admin/orders', async (req, reply) => {
            const schema = zod_1.z.object({
                status: zod_1.z.enum(['NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
                page: zod_1.z.string().transform(Number).default('1'),
                limit: zod_1.z.string().transform(Number).default('10'),
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
        adminApp.get('/api/admin/orders/:id', async (req, reply) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string() });
            const { id } = paramsSchema.parse(req.params);
            const order = await prisma.order.findUnique({ where: { id } });
            return order;
        });
        adminApp.put('/api/admin/orders/:id', async (req, reply) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string() });
            const { id } = paramsSchema.parse(req.params);
            const bodySchema = zod_1.z.object({
                status: zod_1.z.enum(['NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
                assigned_to: zod_1.z.string().optional(),
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
