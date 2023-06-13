import { FastifyRequest, FastifyReply } from 'fastify';

export const isSessionIdInCookies = async (req: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = req.cookies;

    if (!sessionId) {
        return reply.status(401).send({
            message: "Unauthorized"
        })
    }
}