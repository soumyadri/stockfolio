import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

const DEMO_EMAIL = "demo@stockfolio.app";
const DEMO_PASSWORD = "demo1234";
const INITIAL_BALANCE = 1000;

const WATCHLIST_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      isDemo: true,
      wallet: {
        create: {
          balance: INITIAL_BALANCE,
          transactions: {
            create: {
              type: "CREDIT",
              amount: INITIAL_BALANCE,
              balanceAfter: INITIAL_BALANCE,
              reference: "Initial demo wallet funding",
            },
          },
        },
      },
      watchlistItems: {
        create: WATCHLIST_TICKERS.map((ticker) => ({ ticker })),
      },
      holdings: {
        create: {
          ticker: "AAPL",
          quantity: 2,
          avgCost: 175.5,
        },
      },
    },
    include: {
      wallet: true,
      watchlistItems: true,
      holdings: true,
    },
  });

  console.log("Seed complete:");
  console.log(`  User:      ${user.email} (id: ${user.id})`);
  console.log(`  Wallet:    $${user.wallet?.balance.toString()}`);
  console.log(`  Watchlist: ${user.watchlistItems.map((w) => w.ticker).join(", ")}`);
  console.log(
    `  Holdings:  ${user.holdings.map((h) => `${h.quantity} ${h.ticker} @ $${h.avgCost}`).join(", ") || "none"}`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
