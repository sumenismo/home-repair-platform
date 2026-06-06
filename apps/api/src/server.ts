import Fastify from 'fastify'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema.js'
import { buildContext } from './shared/context.js'

export async function buildServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  })

  const yoga = createYoga({
    schema,
    context: buildContext,
    logging: false,
  })

  app.route({
    url: '/graphql',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
      // Fastify parses the body onto req.body, not req.raw.body. graphql-yoga reads
      // nodeRequest.body to detect pre-consumed streams; bridge the gap here.
      if (req.body !== undefined) {
        // graphql-yoga reads nodeRequest.body; Fastify puts it on req.body instead
        ;(req.raw as unknown as { body: unknown }).body = req.body
      }
      const response = await yoga.handleNodeRequestAndResponse(req.raw, reply.raw)
      for (const [name, value] of response.headers) {
        reply.header(name, value)
      }
      return reply.status(response.status).send(response.body)
    },
  })

  app.get('/health', () => ({ status: 'ok' }))

  return app
}
