import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';
import { profileType } from './profile.js';
import { postType } from './post.js';

export const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: GraphQLInt },
    profile: {
      type: profileType,
      resolve: async (
        parent: { id: string },
        args,
        context: { prisma: PrismaClient },
      ) => {
        return await context.prisma.profile.findUnique({
          where: {
            userId: parent.id,
          },
        });
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (
        parent: { id: string },
        args,
        context: { prisma: PrismaClient },
      ) => {
        return await context.prisma.post.findMany({
          where: {
            authorId: parent.id,
          },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (
        parent: { id: string },
        args,
        context: { prisma: PrismaClient },
      ) => {
        const subs = await context.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        });
        return subs;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (
        parent: { id: string },
        args,
        context: { prisma: PrismaClient },
      ) => {
        const subs = await context.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        });
        return subs;
      },
    },
  }),
});
