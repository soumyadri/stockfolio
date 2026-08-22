export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    isDemo: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;
