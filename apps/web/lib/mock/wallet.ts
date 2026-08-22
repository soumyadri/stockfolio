export interface WalletActivity {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface WalletState {
  availableCash: number;
  invested: number;
  activities: WalletActivity[];
}

export const DEFAULT_WALLET: WalletState = {
  availableCash: 1240,
  invested: 46970,
  activities: [
    { id: "1", date: "Aug 18", description: "Bought 10 AAPL", amount: -2284 },
    { id: "2", date: "Aug 15", description: "Sold 5 INFY", amount: 890 },
    { id: "3", date: "Aug 1", description: "Welcome credit", amount: 1000 },
  ],
};

export function getTotalAccountValue(wallet: WalletState): number {
  return wallet.availableCash + wallet.invested;
}
