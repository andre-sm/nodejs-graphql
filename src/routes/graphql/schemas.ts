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
      profile: { type: profileType,
        resolve: async (parent: { id: string }, args, context: { prisma: PrismaClient }) => {
            return await context.prisma.profile.findUnique({
              where: {
                userId: parent.id,
              },
            });
        }
       },
      posts: { type: new GraphQLList(postType),
        resolve: async (parent: { id: string }, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.post.findMany({
            where: {
              authorId: parent.id,
            },
          });
        }
      },
      userSubscribedTo: { type: new GraphQLList(userType),
        resolve: async (parent: { id: string }, args, context: { prisma: PrismaClient }) => {
          const subs = await context.prisma.user.findMany({
            where: {
              subscribedToUser: {
                  some: {
                    subscriberId: parent.id,
                  },
                }
            },
          });
          return subs;
        }
      },
      subscribedToUser: { type: new GraphQLList(userType),
        resolve: async (parent: { id: string }, args, context: { prisma: PrismaClient }) => {
          const subs = await context.prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: parent.id,
                },
              }
            } 
          });
          return subs;
        }
      },
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
      memberType: {
        type: memberTypeType,
        resolve: async (parent: { memberTypeId: string }, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.memberType.findUnique({
            where: {
              id: parent.memberTypeId,
            },
          });
        }
      },
    }),
});

export const queryType = new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      memberTypes: {
        type: new GraphQLList(memberTypeType),
        resolve: async (parent, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.memberType.findMany();
        }
      },
      memberType: {
        type: memberTypeType,
        args: {
          id: { type: new GraphQLNonNull(memberTypeIdType) },
        },
        resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
          return await context.prisma.memberType.findUnique({
            where: {
              id: args.id,
            },
          });
        }
      },
      posts: {
        type: new GraphQLList(postType),
        resolve: async (parent, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.post.findMany();
        }
      },
      post: {
        type: postType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
          try {
            const post = await context.prisma.post.findUnique({
              where: {
                id: args.id,
              },
            });
    
            if (post === null) {
              throw new Error('An error occurred while performing this operation!');
            }
            return post;
          } catch (error) {
            return null;
          }
        }
      },
      users: {
        type: new GraphQLList(userType),
        resolve: async (parent, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.user.findMany();
        }
      },
      user: {
        type: userType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
          try {
            const user =  await context.prisma.user.findUnique({
              where: {
                id: args.id,
              },
            });
  
            if (user === null) {
              throw new Error('An error occurred while performing this operation!');
            }
            return user;
          } catch (error) {
            return null;
          }
        }
      },
      profiles: {
        type: new GraphQLList(profileType),
        resolve: async (parent, args, context: { prisma: PrismaClient }) => {
          return await context.prisma.profile.findMany();
        }
      },
      profile: {
        type: profileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
          try {
            const profile = await context.prisma.profile.findUnique({
              where: {
                id: args.id,
              },
            });
  
            if (profile === null) {
              throw new Error('An error occurred while performing this operation!');
            }
            return profile;
          } catch (error) {
            return null;
          }
        }
      },
    }),
});

export const schema = new GraphQLSchema({ 
  query: queryType, 
  types: [memberTypeIdType, memberTypeType, postType, userType, profileType] 
});


