import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  type Query {
    hello: String
    auth: String
  }
`;

export default typeDefs;
