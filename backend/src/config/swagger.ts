import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Certify API',
      version: '1.0.0',
      description:
        'Public REST API for Certify — certificate generation platform. Use an API key to authenticate.',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'Use your Certify API key as a Bearer token.',
        },
        XApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
          description: 'Alternative: pass API key in X-Api-Key header.',
        },
      },
    },
  },
  apis: ['./src/routes/v1Routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
