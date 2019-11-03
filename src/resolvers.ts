import { DynamoDB } from 'aws-sdk';
import { AuthenticationError } from 'apollo-server-lambda';
import * as uuidv1 from 'uuid/v1';

let options = {};
if (process.env.IS_OFFLINE) {
  options = { region: 'localhost', endpoint: 'http://localhost:8080' };
}

const dynamoDb = new DynamoDB.DocumentClient(options);
const params = { TableName: process.env.DYNAMODB_TABLE };

const resolvers = {
  Query: {
    listMaps: async () => {
      return new Promise((resolve, reject) => {
        dynamoDb.scan(params, (err, data) => {
          if (err) reject(err);
          else resolve(data.Items);
        });
      });
    },
  },
  Mutation: {
    createMap: async (_, args, ctx) => {
      const user = await ctx.user;
      if (!user) {
        throw new AuthenticationError('You must be logged in to do this');
      }
      const Item = {
        id: uuidv1(),
        titleLong: args.titleLong,
        titleShort: args.titleShort,
        buildHook: args.buildHook,
        subdomain: args.subdomain,
        createdAt: Date.now(),
        createdBy: user.email,
        updatedAt: Date.now(),
        updatedBy: user.email,
      };
      return new Promise((resolve, reject) => {
        dynamoDb.put({ ...params, Item }, err => {
          if (err) reject(err);
          else resolve(Item);
        });
      });
    },
    updateMap: () => async (_, args, ctx) => {
      const user = await ctx.user;
      if (!user) {
        throw new AuthenticationError('You must be logged in to do this');
      }
      const updateParams = {
        Key: {
          id: args.id,
        },
        ExpressionAttributeValues: {
          ':titleLong': args.titleLong,
          ':titleShort': args.titleShort,
          ':buildHook': args.buildHook,
          ':subdomain': args.subdomain,
          ':updatedAt': Date.now(),
          ':updatedBy': user.email,
        },
        UpdateExpression:
          'SET titleLong = :titleLong, ' +
          'titleShort = :titleShort, ' +
          'buildHook = :buildHook, ' +
          'subdomain = :subdomain, ' +
          'updatedAt = :updatedAt, ' +
          'updatedBy = :updatedBy',
        ReturnValues: 'ALL_NEW',
      };
      return new Promise((resolve, reject) => {
        dynamoDb.update({ ...params, ...updateParams }, (err, data) => {
          if (err) reject(err);
          else resolve(data.Attributes);
        });
      });
    },
    deleteMap: () => async (_, args, ctx) => {
      const user = await ctx.user;
      if (!user) {
        throw new AuthenticationError('You must be logged in to do this');
      }
      const Key = { id: args.id };
      return new Promise((resolve, reject) => {
        dynamoDb.delete({ ...params, Key }, (err, data) => {
          if (err) reject(err);
          else resolve(data.Attributes);
        });
      });
    },
  },
};

export default resolvers;
