"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const server = (0, fastify_1.default)({
    logger: true
});
server.register(cors_1.default, {
    origin: true, // Adjust for production
    credentials: true
});
server.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'supersecret'
});
server.register(cookie_1.default);
server.get('/health', async () => {
    return { status: 'ok' };
});
const auth_1 = require("./routes/auth");
const options_1 = require("./routes/options");
const orders_1 = require("./routes/orders");
const dashboard_1 = require("./routes/dashboard");
server.register(auth_1.authRoutes, { prefix: '/api/admin' });
server.register(options_1.optionsRoutes);
server.register(orders_1.ordersRoutes);
server.register(dashboard_1.dashboardRoutes);
const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
