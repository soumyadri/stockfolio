import { graphqlRequest } from "./client";
import { getStoredToken } from "../auth/token";

export interface OrderResult {
  id: string;
  ticker: string;
  side: string;
  quantity: number;
  filledPrice: number;
  status: string;
}

const PLACE_ORDER_MUTATION = `
  mutation PlaceOrder($ticker: String!, $side: OrderSide!, $quantity: Float!, $confirmedPrice: Float!) {
    placeOrder(ticker: $ticker, side: $side, quantity: $quantity, confirmedPrice: $confirmedPrice) {
      id ticker side quantity filledPrice status
    }
  }
`;

export async function placeOrder(
  ticker: string,
  side: "BUY" | "SELL",
  quantity: number,
  confirmedPrice: number,
): Promise<OrderResult> {
  const data = await graphqlRequest<{ placeOrder: OrderResult }>(
    PLACE_ORDER_MUTATION,
    { ticker: ticker.toUpperCase(), side, quantity, confirmedPrice },
    getStoredToken() ?? undefined,
  );
  return data.placeOrder;
}
