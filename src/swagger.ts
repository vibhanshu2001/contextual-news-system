import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Express } from 'express';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger Docs available at http://localhost:2056/api-docs');
};