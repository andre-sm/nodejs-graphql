import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import DataLoader from 'dataloader';
import { UUIDType } from './uuid.js';
import { profileType } from './profile.js';
import { postType } from './post.js';
import { Context } from './context.js';
import { Post } from '@prisma/client';

export const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: GraphQLInt },
    profile: {
      type: profileType,
      resolve: async (parent: { id: string }, args, context: Context) => {
        const { prisma, loaders } = context;

        let profileLoader = loaders['profiles'];
        if (!profileLoader) {
          profileLoader = new DataLoader(async (ids: Readonly<string[]>) => {
            const profiles = await prisma.profile.findMany({
              where: {
                userId: { in: ids as string[] },
              },
            });

            return ids.map((id) => profiles.find((profile) => profile.userId === id));
          });

          loaders['profiles'] = profileLoader;
        }

        return profileLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async (parent: { id: string }, args, context: Context) => {
        const { prisma, loaders } = context;

        let postLoader = loaders['posts'];
        if (!postLoader) {
          postLoader = new DataLoader(async (ids: Readonly<string[]>) => {
            const posts = await prisma.post.findMany({
              where: {
                authorId: { in: ids as string[] },
              },
            });

            const sortedPosts: { [key: string]: Post[] } = {};
            posts.forEach((post) => {
              if (sortedPosts[post.authorId]) {
                sortedPosts[post.authorId].push(post);
              } else {
                sortedPosts[post.authorId] = [post];
              }
            });

            return ids.map((authorId) => sortedPosts[authorId]);
          });

          loaders['posts'] = postLoader;
        }

        return postLoader.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async (parent: { id: string }, args, context: Context) => {
        const { prisma, loaders } = context;

        let subsLoader = loaders['userSubscribedTo'];
        if (!subsLoader) {
          subsLoader = new DataLoader(async (ids: Readonly<string[]>) => {
            const users = await prisma.user.findMany({
              where: {
                subscribedToUser: {
                  some: {
                    subscriberId: { in: ids as string[] },
                  },
                },
              },
              include: { subscribedToUser: true },
            });
            return ids.map((id) =>
              users.filter((user) =>
                user.subscribedToUser.find((sub) => sub.subscriberId === id),
              ),
            );
          });

          loaders['userSubscribedTo'] = subsLoader;
        }

        return subsLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async (parent: { id: string }, args, context: Context) => {
        const { prisma, loaders } = context;

        let subsLoader = loaders['subscribedToUser'];
        if (!subsLoader) {
          subsLoader = new DataLoader(async (ids: Readonly<string[]>) => {
            const users = await prisma.user.findMany({
              where: {
                userSubscribedTo: {
                  some: {
                    authorId: { in: ids as string[] },
                  },
                },
              },
              include: { userSubscribedTo: true },
            });
            return ids.map((id) =>
              users.filter((user) =>
                user.userSubscribedTo.find((sub) => sub.authorId === id),
              ),
            );
          });

          loaders['subscribedToUser'] = subsLoader;
        }

        return subsLoader.load(parent.id);
      },
    },
  }),
});
