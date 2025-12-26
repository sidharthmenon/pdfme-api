import { generate } from '@pdfme/generator';
import { createApiKeyPreHandler } from './auth.js';
import { getPlugins } from './plugins.js';
import { getFontsData } from './fonts.js';

const apiKeyPreHandler = createApiKeyPreHandler();

export default async function pdfRoutes(fastify) {
  fastify.post(
    '/generate',
    {
      preHandler: apiKeyPreHandler
    },
    async (request, reply) => {

      if (!request.body) {
        return reply.code(400).send({
          error: 'Request body is required and must be JSON'
        });
      }
      
      const { template, inputs } = request.body;

      if (!template || !inputs) {
        return reply.code(400).send({
          error: 'template and inputs are required'
        });
      }

      try {
        const pdf = await generate({
          template,
          inputs,
          options: {
            font: getFontsData(),
            title: 'pdfme',
          },
          plugins: getPlugins(),
        })

        reply
          .header('Content-Type', 'application/pdf')
          .header(
            'Content-Disposition',
            'attachment; filename="generated.pdf"'
          )
          .send(Buffer.from(pdf));
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({
          error: 'PDF generation failed',
          message: err.message
        });
      }
    }
  );
}
