import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { memberTypeIdType, memberTypeType } from './member-type.js';
import { Context } from './context.js';
import DataLoader from 'dataloader';

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
      resolve: async (parent: { memberTypeId: string }, args, context: Context) => {
        const { prisma, loaders } = context;

        let memberTypeLoader = loaders['memberTypes'];
        if (!memberTypeLoader) {
          memberTypeLoader = new DataLoader(async (ids: Readonly<string[]>) => {
            const memberTypes = await prisma.memberType.findMany({
              where: {
                id: { in: ids as string[] },
              },
            });

            return ids.map((id) =>
              memberTypes.find((memberType) => memberType.id === id),
            );
          });

          loaders['memberTypes'] = memberTypeLoader;
        }

        return memberTypeLoader.load(parent.memberTypeId);
      },
    },
  }),
});
