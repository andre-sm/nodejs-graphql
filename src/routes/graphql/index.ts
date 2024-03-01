import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const parsedQueryTree = parse(query);
      const validationRules = [depthLimit(5)];
      const validationErrors = validate(schema, parsedQueryTree, validationRules);

      if (validationErrors.length !== 0) {
        return {
          data: null,
          errors: validationErrors
        };
      } else {
        return await graphql({
          schema,
          source: query,
          contextValue: { prisma },
          variableValues: variables,
        });
      }
    },
  });
};

export default plugin;
