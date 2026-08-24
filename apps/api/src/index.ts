import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import cors from "cors";
import express from "express";
import { createContext } from "./context.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { typeDefs } from "./graphql/schema.js";
import { initStockConfigCache } from "./services/priceService.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

await initStockConfigCache();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => createContext(req),
  }),
);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
