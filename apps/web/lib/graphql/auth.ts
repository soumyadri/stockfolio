import { graphqlRequest } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  isDemo: boolean;
}

interface AuthPayload {
  token: string;
  user: AuthUser;
}

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id email isDemo }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user { id email isDemo }
    }
  }
`;

export async function loginUser(email: string, password: string): Promise<AuthPayload> {
  const data = await graphqlRequest<{ login: AuthPayload }>(LOGIN_MUTATION, {
    email,
    password,
  });
  return data.login;
}

export async function registerUser(email: string, password: string): Promise<AuthPayload> {
  const data = await graphqlRequest<{ register: AuthPayload }>(REGISTER_MUTATION, {
    email,
    password,
  });
  return data.register;
}
