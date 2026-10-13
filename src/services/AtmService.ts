import type { IStorage } from "../interfaces/IStorage";
import type { ITransaction } from "../interfaces/ITransaction";
import { Account } from "../models/Account";
import { AccountLockedError, InvalidPinError } from "../errors/AtmErrors";

const MAX_ATTEMPTS = 3;

export class AtmService {
  private accounts: Account[] = [];
  private failedAttempts = new Map<string, number>(); // cardNumber -> wrong tries

  constructor(private storage: IStorage) {}

  async init(): Promise<void> {
    const data = await this.storage.loadAccounts();
    this.accounts = data.map((a) => new Account(a));
  }

  async login(cardNumber: string, pin: string): Promise<Account> {
    const account = this.accounts.find((a) => a.cardNumber === cardNumber);

    if (!account) throw new InvalidPinError("Invalid card number or PIN.");

    if (account.isLocked) {
      throw new AccountLockedError("This card is locked. Please contact the bank.");
    }

    if (!account.verifyPin(pin)) {
      const attempts = (this.failedAttempts.get(cardNumber) ?? 0) + 1;
      this.failedAttempts.set(cardNumber, attempts);

      if (attempts >= MAX_ATTEMPTS) {
        account.isLocked = true;
        await this.save();
        throw new AccountLockedError("Card locked after 3 wrong PIN attempts.");
      }

      throw new InvalidPinError(
        `Wrong PIN. ${MAX_ATTEMPTS - attempts} attempt(s) left.`
      );
    }

    this.failedAttempts.delete(cardNumber);
    return account;
  }

  getBalance(account: Account): number {
    return account.balance;
  }

  async deposit(account: Account, amount: number): Promise<void> {
    account.deposit(amount);
    await this.save();
  }

  async withdraw(account: Account, amount: number): Promise<void> {
    account.withdraw(amount);
    await this.save();
  }

  getMiniStatement(account: Account, count = 5): ITransaction[] {
    return account.transactions.slice(-count).reverse();
  }

  async changePin(account: Account, oldPin: string, newPin: string): Promise<void> {
    if (!account.verifyPin(oldPin)) {
      throw new InvalidPinError("Current PIN is incorrect.");
    }
    if (!/^\d{4}$/.test(newPin)) {
      throw new InvalidPinError("New PIN must be exactly 4 digits.");
    }
    if (oldPin === newPin) {
      throw new InvalidPinError("New PIN must be different from the old PIN.");
    }
    account.changePin(newPin);
    await this.save();
  }

  private async save(): Promise<void> {
    await this.storage.saveAccounts(this.accounts);
  }
}