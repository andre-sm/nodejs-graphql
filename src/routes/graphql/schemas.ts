import { Type } from '@fastify/type-provider-typebox';
import { 
  GraphQLBoolean,
  GraphQLEnumType, 
  GraphQLFloat, 
  GraphQLInt, 
  GraphQLList, 
  GraphQLNonNull, 
  GraphQLObjectType, 
  GraphQLSchema, 
  GraphQLString,
} from "graphql"
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';

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

const memberTypeIdType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

const memberTypeType = new GraphQLObjectType({
    name: "MemberType",
    fields: () => ({
        id: { type: new GraphQLNonNull(memberTypeIdType) },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
      }),
});

const postType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    }),
});

const userType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: GraphQLInt },
    }),
});

const profileType = new GraphQLObjectType({
  name: "Profile",
  fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      userId: { type: new GraphQLNonNull(UUIDType) },
      memberTypeId: { type: new GraphQLNonNull(memberTypeIdType) },
    }),
});

export const queryType = new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      memberTypes: {
        type: new GraphQLList(memberTypeType),
        resolve: async (obj, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.memberType.findMany();
        }
      },
      memberType: {
        type: memberTypeType,
        args: {
          id: { type: new GraphQLNonNull(memberTypeIdType) },
        },
        resolve: async (obj, args: { id: string }, context: { prisma: PrismaClient }) => {
          return await context.prisma.memberType.findUnique({
            where: {
              id: args.id,
            },
          });
        }
      },
      posts: {
        type: new GraphQLList(postType),
        resolve: async (obj, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.post.findMany();
        }
      },
      post: {
        type: postType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (obj, args: { id: string }, context: { prisma: PrismaClient }) => {
          return await context.prisma.post.findUnique({
            where: {
              id: args.id,
            },
          });
        }
      },
      users: {
        type: new GraphQLList(userType),
        resolve: async (obj, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.user.findMany();
        }
      },
      user: {
        type: userType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (obj, args: { id: string }, context: { prisma: PrismaClient }) => {
          return await context.prisma.user.findUnique({
            where: {
              id: args.id,
            },
          });
        }
      },
      profiles: {
        type: new GraphQLList(profileType),
        resolve: async (obj, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.profile.findMany();
        }
      },
      profile: {
        type: profileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (obj, args: { id: string }, context: { prisma: PrismaClient }) => {
          return await context.prisma.profile.findUnique({
            where: {
              id: args.id,
            },
          });
        }
      },
    }),
});

export const schema = new GraphQLSchema({ 
  query: queryType, 
  types: [memberTypeIdType, memberTypeType, postType, userType, profileType] 
});


