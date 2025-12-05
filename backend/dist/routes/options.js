"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsRoutes = optionsRoutes;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const prisma = new client_1.PrismaClient();
async function optionsRoutes(app) {
    // Public route to get active options
    app.get('/api/options', async (req, reply) => {
        const options = await prisma.option.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
        });
        return options;
    });
    // Admin routes
    app.register(async (adminApp) => {
        adminApp.addHook('onRequest', auth_1.authenticate);
        adminApp.get('/api/admin/options', async (req, reply) => {
            const schema = zod_1.z.object({
                type: zod_1.z.enum(['RECHEIO', 'MASSA', 'COBERTURA', 'TAMANHO', 'ADICIONAL']).optional(),
            });
            const query = schema.parse(req.query);
            const options = await prisma.option.findMany({
                where: query.type ? { type: query.type } : undefined,
                orderBy: { order: 'asc' },
            });
            return options;
        });
        adminApp.post('/api/admin/options', async (req, reply) => {
            const schema = zod_1.z.object({
                type: zod_1.z.enum(['RECHEIO', 'MASSA', 'COBERTURA', 'TAMANHO', 'ADICIONAL']),
                name: zod_1.z.string(),
                slug: zod_1.z.string(),
                price: zod_1.z.number().default(0),
                active: zod_1.z.boolean().default(true),
                order: zod_1.z.number().default(0),
                meta: zod_1.z.any().optional(),
            });
            const body = schema.parse(req.body);
            const option = await prisma.option.create({
                data: body,
            });
            return option;
        });
        adminApp.put('/api/admin/options/:id', async (req, reply) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string() });
            const { id } = paramsSchema.parse(req.params);
            const bodySchema = zod_1.z.object({
                name: zod_1.z.string().optional(),
                slug: zod_1.z.string().optional(),
                price: zod_1.z.number().optional(),
                active: zod_1.z.boolean().optional(),
                order: zod_1.z.number().optional(),
                meta: zod_1.z.any().optional(),
            });
            const body = bodySchema.parse(req.body);
            const option = await prisma.option.update({
                where: { id },
                data: body,
            });
            return option;
        });
        adminApp.delete('/api/admin/options/:id', async (req, reply) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string() });
            const { id } = paramsSchema.parse(req.params);
            await prisma.option.delete({ where: { id } });
            return { message: 'Option deleted' };
        });
    });
}
