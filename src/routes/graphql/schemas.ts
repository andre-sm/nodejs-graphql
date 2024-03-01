import { Type } from '@fastify/type-provider-typebox';
import { 
  GraphQLBoolean,
  GraphQLEnumType, 
  GraphQLFloat, 
  GraphQLInputObjectType, 
  GraphQLInt, 
  GraphQLList, 
  GraphQLNonNull, 
  GraphQLObjectType, 
  GraphQLSchema, 
  GraphQLString,
} from 'graphql'
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
    name: 'MemberType',
    fields: () => ({
        id: { type: new GraphQLNonNull(memberTypeIdType) },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
      }),
});

const postType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
      id: { type: new GraphQLNonNull(UUIDType) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    }),
});

const userType = new GraphQLObjectType({
  name: 'User',
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
  name: 'Profile',
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

const queryType = new GraphQLObjectType({
    name: 'Query',
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
              throw new Error('An error occurred while performing operation');
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
              throw new Error('An error occurred while performing operation');
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
              throw new Error('An error occurred while performing operation');
            }
            return profile;
          } catch (error) {
            return null;
          }
        }
      },
    }),
});

interface postDto {
  title: string;
  content: string; 
  authorId: string;
}

interface userDto {
  name: string; 
  balance: number;
}

interface profileDto {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
}

const postInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
});

const userInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: GraphQLFloat },
    },
});

const profileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      userId: { type: new GraphQLNonNull(UUIDType) },
      memberTypeId: { type: new GraphQLNonNull(memberTypeIdType) },
    },
});

const postChangeInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
    },
});

const profileChangeInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
      isMale: { type: GraphQLBoolean },
    },
});

const userChangeInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
    },
});

const mutations = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: postType,
      args: {
        dto: { type: new GraphQLNonNull(postInputType) },
      },
      resolve: async (parent, { dto }: { dto: postDto }, context: { prisma: PrismaClient }) => {
        const newPost = await context.prisma.post.create({
          data: dto
        });

        return newPost;
      }
    },
    createUser: {
      type: userType,
      args: {
        dto: { type: new GraphQLNonNull(userInputType) },
      },
      resolve: async (parent, { dto }: { dto: userDto }, context: { prisma: PrismaClient }) => {
        const newUser = await context.prisma.user.create({
          data: dto
        });

        return newUser;
      }
    },
    createProfile: {
      type: profileType,
      args: {
        dto: { type: new GraphQLNonNull(profileInputType) },
      },
      resolve: async (parent, { dto }: { dto: profileDto }, context: { prisma: PrismaClient }) => {
        const { yearOfBirth } = dto;
        const currentYear = new Date().getFullYear();

        if (!Number.isInteger(yearOfBirth) || !(yearOfBirth >= 1900 && yearOfBirth <= currentYear)) {
          throw new Error('Error: Int cannot represent non-integer value: 123.321');
        } 

        const newProfile = await context.prisma.profile.create({
          data: dto
        });

        return newProfile;
      }
    },
    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
        await context.prisma.post.delete({
          where: { id: args.id },
        });
      }
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
        await context.prisma.profile.delete({
          where: { id: args.id },
        });
      }
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { id: string }, context: { prisma: PrismaClient }) => {
        await context.prisma.user.delete({
          where: { id: args.id },
        });
      }
    },
    changePost: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(postChangeInputType) },
      },
      resolve: async (parent, args: { id: string, dto: postDto }, context: { prisma: PrismaClient }) => {
        try {
          const updatedPost = await context.prisma.post.update({
            where: { id: args.id },
            data: {
              title: args.dto.title
            },
          });
          return updatedPost;
        } catch (error) {
          console.error('Error: An error occurred while updating post');
        }
      }
    },
    changeProfile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(profileChangeInputType) },
      },
      resolve: async (parent, args: { id: string, dto: profileDto }, context: { prisma: PrismaClient }) => {
          // if (!args.dto.userId) {
          //   throw new Error(`Field ${args.dto.userId} is not defined by type "ChangeProfileInput"`);
          // }

          return await context.prisma.profile.update({
            where: { id: args.id },
            data: {
              isMale: args.dto.isMale
            },
          });
      }
    },
    changeUser: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(userChangeInputType) },
      },
      resolve: async (parent, args: { id: string, dto: userDto }, context: { prisma: PrismaClient }) => {
        try {
          const updatedUser = await context.prisma.user.update({
            where: { id: args.id },
            data: {
              name: args.dto.name
            },
          });
  
          return updatedUser;
        } catch (error) {
          console.error('Error: An error occurred while updating user');
        }
      }
    },
    subscribeTo: {
      type: userType,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { userId: string; authorId: string }, context: { prisma: PrismaClient }) => {
        try {
          return await context.prisma.user.update({
            where: { id: args.userId },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId
                }
              },
            },
          });
  
        } catch (error) {
          console.error('Error: An error occurred while updating user');
        }
      }
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (parent, args: { userId: string; authorId: string }, context: { prisma: PrismaClient }) => {
        try {
          await context.prisma.subscribersOnAuthors.delete({
            where: { 
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              } 
             },
          });
  
          return true;
        } catch (error) {
          console.error('Error: An error occurred while unsubscribe');
          return false;
        }
      }
    },
  }
});

export const schema = new GraphQLSchema({ 
  query: queryType,
  mutation: mutations,
});


