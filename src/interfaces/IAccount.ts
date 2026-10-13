import type { ITransaction } from "./ITransaction";

export interface IAccount {
  cardNumber: string;
  holderName: string;
  pin: string;          
  balance: number;
  isLocked: boolean;
  transactions: ITransaction[];
}
