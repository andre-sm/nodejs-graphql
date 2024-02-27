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
    BASIC: { value: 'basic' },
    BUSINESS: { value: 'business' },
  },
});

const memberType = new GraphQLObjectType({
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
      balance: { type: new GraphQLNonNull(GraphQLInt) },
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
        type: new GraphQLList(memberType),
        resolve: async (obj, args, context: PrismaClient) => {
          return await context.memberType.findMany();
        }
      },
      posts: {
        type: new GraphQLList(postType),
        resolve: async (obj, args, context: PrismaClient) => {
          return await context.post.findMany();
        }
      },
      users: {
        type: new GraphQLList(userType),
        resolve: async (obj, args, context: PrismaClient) => {
          return await context.user.findMany();
        }
      },
      profiles: {
        type: new GraphQLList(profileType),
        resolve: async (obj, args, context: PrismaClient) => {
          return await context.profile.findMany();
        }
      }
    }),
});

export const schema = new GraphQLSchema({ query: queryType });
