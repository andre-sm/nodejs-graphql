import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { memberTypeIdType, memberTypeType } from './member-type.js';
import { PrismaClient } from '@prisma/client';

export const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(memberTypeIdType) },
    memberType: {
      type: memberTypeType,
      resolve: async (
        parent: { memberTypeId: string },
        args,
        context: { prisma: PrismaClient },
      ) => {
        return await context.prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId,
          },
        });
      },
    },
  }),
});
