import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';

const prisma = new PrismaClient();

export async function optionsRoutes(app: FastifyInstance) {
    // Public route to get active options
    app.get('/api/options', async (req: FastifyRequest, reply: FastifyReply) => {
        const options = await prisma.option.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
        });
        return options;
    });

    // Admin routes
    app.register(async (adminApp: FastifyInstance) => {
        adminApp.addHook('onRequest', authenticate);

        adminApp.get('/api/admin/options', async (req: FastifyRequest, reply: FastifyReply) => {
            const schema = z.object({
                type: z.enum(['RECHEIO', 'MASSA', 'COBERTURA', 'TAMANHO', 'ADICIONAL']).optional(),
            });
            const query = schema.parse(req.query);

            const options = await prisma.option.findMany({
                where: query.type ? { type: query.type } : undefined,
                orderBy: { order: 'asc' },
            });
            return options;
        });

        adminApp.post('/api/admin/options', async (req: FastifyRequest, reply: FastifyReply) => {
            const schema = z.object({
                type: z.enum(['RECHEIO', 'MASSA', 'COBERTURA', 'TAMANHO', 'ADICIONAL']),
                name: z.string(),
                slug: z.string(),
                price: z.number().default(0),
                active: z.boolean().default(true),
                order: z.number().default(0),
                meta: z.any().optional(),
            });

            const body = schema.parse(req.body);
            const option = await prisma.option.create({
                data: body,
            });
            return option;
        });

        adminApp.put('/api/admin/options/:id', async (req: FastifyRequest, reply: FastifyReply) => {
            const paramsSchema = z.object({ id: z.string() });
            const { id } = paramsSchema.parse(req.params);

            const bodySchema = z.object({
                name: z.string().optional(),
                slug: z.string().optional(),
                price: z.number().optional(),
                active: z.boolean().optional(),
                order: z.number().optional(),
                meta: z.any().optional(),
            });

            const body = bodySchema.parse(req.body);
            const option = await prisma.option.update({
                where: { id },
                data: body,
            });
            return option;
        });

        adminApp.delete('/api/admin/options/:id', async (req: FastifyRequest, reply: FastifyReply) => {
            const paramsSchema = z.object({ id: z.string() });
            const { id } = paramsSchema.parse(req.params);

            await prisma.option.delete({ where: { id } });
            return { message: 'Option deleted' };
        });
    });
}
