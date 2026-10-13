export type TransactionType = "DEPOSIT" | "WITHDRAW" | "PIN_CHANGE";

export interface ITransaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;          // ISO string (easy to store in JSON)
  balanceAfter: number;
}