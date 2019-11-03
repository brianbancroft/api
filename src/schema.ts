import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  type Map {
    id: ID!
    titleLong: String!
    titleShort: String!
    buildHook: String!
    subdomain: String!
    createdAt: Float!
    createdBy: String!
    updatedAt: Float!
    updatedBy: String!
  }

  type Query {
    listMaps: [Map!]!
  }

  type Mutation {
    createMap(
      titleLong: String!
      titleShort: String!
      buildHook: String!
      subdomain: String!
    ): Map!
    updateMap(
      id: ID!
      titleLong: String!
      titleShort: String!
      buildHook: String!
      subdomain: String!
    ): Map!
    deleteMap(id: ID!): Map!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

export default typeDefs;
