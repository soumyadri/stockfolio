-- CreateTable
CREATE TABLE "Stock" (
    "ticker" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "tickerSeed" INTEGER NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("ticker")
);
