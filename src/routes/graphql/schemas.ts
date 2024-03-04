import { Type } from '@fastify/type-provider-typebox';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';
import { memberTypeIdType, memberTypeType } from './types/member-type.js';
import { postType } from './types/post.js';
import { userType } from './types/user.js';
import { profileType } from './types/profile.js';
import { mutations } from './mutations.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    memberTypes: {
      type: new GraphQLList(memberTypeType),
      resolve: async (parent, args, context: { prisma: PrismaClient }) => {
        return await context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: memberTypeType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeIdType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        return await context.prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (parent, args, context: { prisma: PrismaClient }) => {
        return await context.prisma.post.findMany();
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        try {
          const post = await context.prisma.post.findUnique({
            where: {
              id: args.id,
            },
          });

          if (post === null) {
            throw new Error('An error occurred while performing operation');
          }
          return post;
        } catch (error) {
          return null;
        }
      },
    },
    users: {
      type: new GraphQLList(userType),
      resolve: async (parent, args, context: { prisma: PrismaClient }) => {
        return await context.prisma.user.findMany();
      },
    },
    user: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        try {
          const user = await context.prisma.user.findUnique({
            where: {
              id: args.id,
            },
          });

          if (user === null) {
            throw new Error('An error occurred while performing operation');
          }
          return user;
        } catch (error) {
          return null;
        }
      },
    },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: async (parent, args, context: { prisma: PrismaClient }) => {
        return await context.prisma.profile.findMany();
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        try {
          const profile = await context.prisma.profile.findUnique({
            where: {
              id: args.id,
            },
          });

          if (profile === null) {
            throw new Error('An error occurred while performing operation');
          }
          return profile;
        } catch (error) {
          return null;
        }
      },
    },
  }),
});

export const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutations,
});
