import { ApolloServer } from 'apollo-server-lambda';
import typeDefs from './schema';
import resolvers from './resolvers';
import context from './auth';

const server = new ApolloServer({ typeDefs, resolvers, context });

export const graphqlHandler = server.createHandler({ cors: { origin: true } });
