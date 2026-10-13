// services/FileStorage.ts
import { promises as fs } from "fs";
import type { IStorage } from "../interfaces/IStorage";
import type { IAccount } from "../interfaces/IAccount";
import { StorageError } from "../errors/AtmErrors";

export class FileStorage implements IStorage {
  constructor(private filePath: string) {}

  async loadAccounts(): Promise<IAccount[]> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as IAccount[];
    } catch (err) {
      throw new StorageError(`Could not read data file: ${(err as Error).message}`);
    }
  }

  async saveAccounts(accounts: IAccount[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(accounts, null, 2));
    } catch (err) {
      throw new StorageError(`Could not save data: ${(err as Error).message}`);
    }
  }
}