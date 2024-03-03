import { PrismaClient } from '@prisma/client';
import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './types/uuid.js';
import {
  postChangeInputType,
  postInputType,
  profileChangeInputType,
  profileInputType,
  userChangeInputType,
  userInputType,
} from './types/inputs.js';
import { postDto, profileDto, userDto } from './types/dto.js';
import { userType } from './types/user.js';
import { postType } from './types/post.js';
import { profileType } from './types/profile.js';

export const mutations = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: postType,
      args: {
        dto: { type: new GraphQLNonNull(postInputType) },
      },
      resolve: async (
        parent,
        { dto }: { dto: postDto },
        context: { prisma: PrismaClient },
      ) => {
        const newPost = await context.prisma.post.create({
          data: dto,
        });

        return newPost;
      },
    },
    createUser: {
      type: userType,
      args: {
        dto: { type: new GraphQLNonNull(userInputType) },
      },
      resolve: async (
        parent,
        { dto }: { dto: userDto },
        context: { prisma: PrismaClient },
      ) => {
        const newUser = await context.prisma.user.create({
          data: dto,
        });

        return newUser;
      },
    },
    createProfile: {
      type: profileType,
      args: {
        dto: { type: new GraphQLNonNull(profileInputType) },
      },
      resolve: async (
        parent,
        { dto }: { dto: profileDto },
        context: { prisma: PrismaClient },
      ) => {
        const { yearOfBirth } = dto;
        const currentYear = new Date().getFullYear();

        if (
          !Number.isInteger(yearOfBirth) ||
          !(yearOfBirth >= 1900 && yearOfBirth <= currentYear)
        ) {
          throw new Error('Error: Int cannot represent non-integer value: 123.321');
        }

        const newProfile = await context.prisma.profile.create({
          data: dto,
        });

        return newProfile;
      },
    },
    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        await context.prisma.post.delete({
          where: { id: args.id },
        });
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        await context.prisma.profile.delete({
          where: { id: args.id },
        });
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { id: string },
        context: { prisma: PrismaClient },
      ) => {
        await context.prisma.user.delete({
          where: { id: args.id },
        });
      },
    },
    changePost: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(postChangeInputType) },
      },
      resolve: async (
        parent,
        args: { id: string; dto: postDto },
        context: { prisma: PrismaClient },
      ) => {
        try {
          const updatedPost = await context.prisma.post.update({
            where: { id: args.id },
            data: {
              title: args.dto.title,
            },
          });
          return updatedPost;
        } catch (error) {
          console.error('Error: An error occurred while updating post');
        }
      },
    },
    changeProfile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(profileChangeInputType) },
      },
      resolve: async (
        parent,
        args: { id: string; dto: profileDto },
        context: { prisma: PrismaClient },
      ) => {
        return await context.prisma.profile.update({
          where: { id: args.id },
          data: {
            isMale: args.dto.isMale,
          },
        });
      },
    },
    changeUser: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(userChangeInputType) },
      },
      resolve: async (
        parent,
        args: { id: string; dto: userDto },
        context: { prisma: PrismaClient },
      ) => {
        try {
          const updatedUser = await context.prisma.user.update({
            where: { id: args.id },
            data: {
              name: args.dto.name,
            },
          });

          return updatedUser;
        } catch (error) {
          console.error('Error: An error occurred while updating user');
        }
      },
    },
    subscribeTo: {
      type: userType,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { userId: string; authorId: string },
        context: { prisma: PrismaClient },
      ) => {
        try {
          return await context.prisma.user.update({
            where: { id: args.userId },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId,
                },
              },
            },
          });
        } catch (error) {
          console.error('Error: An error occurred while updating user');
        }
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        parent,
        args: { userId: string; authorId: string },
        context: { prisma: PrismaClient },
      ) => {
        try {
          await context.prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });

          return true;
        } catch (error) {
          console.error('Error: An error occurred while unsubscribe');
          return false;
        }
      },
    },
  },
});
