import type { IAccount } from "./IAccount";

export interface IStorage {
  loadAccounts(): Promise<IAccount[]>;
  saveAccounts(accounts: IAccount[]): Promise<void>;
}