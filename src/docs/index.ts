import swaggerJsDoc from 'swagger-jsdoc';

import { baseUrl } from '../configVars';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chichkhan API',
      version: '1.0.0',
      description: 'Chichkhan backend API routes',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Development',
      },
    ],
  },
  apis: ['./src/docs/**/*.ts', './src/docs/*.ts'],
  swaggerOptions: {
    docExpansion: 'none', // Collapse all operations by default
  },
};

export const specs = swaggerJsDoc(options);
