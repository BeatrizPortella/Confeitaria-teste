"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const authenticate = async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.send(err);
    }
};
exports.authenticate = authenticate;
