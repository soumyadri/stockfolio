import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

const DEMO_EMAIL = "demo@stockfolio.app";
const DEMO_PASSWORD = "demo1234";
const INITIAL_BALANCE = 1000;

const STOCKS = [
  { ticker: "AAPL", companyName: "Apple Inc.", basePrice: 228.4 },
  { ticker: "TSLA", companyName: "Tesla Inc.", basePrice: 241.1 },
  { ticker: "MSFT", companyName: "Microsoft Corp.", basePrice: 415.2 },
  { ticker: "GOOGL", companyName: "Alphabet Inc.", basePrice: 175.5 },
  { ticker: "AMZN", companyName: "Amazon.com Inc.", basePrice: 198.3 },
  { ticker: "NVDA", companyName: "NVIDIA Corp.", basePrice: 875.4 },
  { ticker: "META", companyName: "Meta Platforms Inc.", basePrice: 512.8 },
  { ticker: "INFY", companyName: "Infosys Ltd.", basePrice: 1780.0 },
  { ticker: "RELIANCE", companyName: "Reliance Industries", basePrice: 2940.0 },
  { ticker: "JPM", companyName: "JPMorgan Chase & Co.", basePrice: 198.6 },
  { ticker: "V", companyName: "Visa Inc.", basePrice: 278.9 },
  { ticker: "WMT", companyName: "Walmart Inc.", basePrice: 68.4 },
  { ticker: "DIS", companyName: "Walt Disney Co.", basePrice: 112.5 },
  { ticker: "NFLX", companyName: "Netflix Inc.", basePrice: 682.3 },
  { ticker: "AMD", companyName: "Advanced Micro Devices", basePrice: 156.7 },
  { ticker: "INTC", companyName: "Intel Corp.", basePrice: 22.8 },
  { ticker: "BA", companyName: "Boeing Co.", basePrice: 178.2 },
  { ticker: "KO", companyName: "Coca-Cola Co.", basePrice: 62.4 },
  { ticker: "PEP", companyName: "PepsiCo Inc.", basePrice: 168.9 },
  { ticker: "IBM", companyName: "IBM Corp.", basePrice: 215.3 },
];

const WATCHLIST_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"];

async function main() {
  for (let i = 0; i < STOCKS.length; i++) {
    await prisma.stock.upsert({
      where: { ticker: STOCKS[i].ticker },
      update: {},
      create: { ...STOCKS[i], tickerSeed: i * 137 },
    });
  }

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
  console.log(`  Stocks:    ${STOCKS.length} tickers`);
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
