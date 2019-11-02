import { AuthenticationError } from 'apollo-server-lambda';

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    auth: async (_, __, ctx) => {
      const user = await ctx.user;
      if (!user) {
        throw new AuthenticationError('You must be logged in to do this');
      }
      return 'Authorized';
    },
  },
};

export default resolvers;
