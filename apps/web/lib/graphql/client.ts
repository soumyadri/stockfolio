const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("No data returned from GraphQL");
  }

  return json.data;
}
