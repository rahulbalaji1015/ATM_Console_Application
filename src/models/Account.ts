import type { IAccount } from "../interfaces/IAccount";
import type { ITransaction, TransactionType } from "../interfaces/ITransaction";
import { InsufficientFundsError, InvalidAmountError } from "../errors/AtmErrors";

export class Account implements IAccount {
  cardNumber!: string;
  holderName!: string;
  pin!: string;
  balance!: number;
  isLocked!: boolean;
  transactions!: ITransaction[];

  constructor(data: IAccount) {
    Object.assign(this, data);
  }

  deposit(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0)
      throw new InvalidAmountError("Amount must be a positive number.");
    this.balance += amount;
    this.record("DEPOSIT", amount);
  }

  withdraw(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0 || amount % 100 !== 0)
      throw new InvalidAmountError("Enter a positive multiple of 100.");
    if (amount > this.balance)
      throw new InsufficientFundsError("Insufficient balance.");
    this.balance -= amount;
    this.record("WITHDRAW", amount);
  }

  verifyPin(input: string): boolean {
    return this.pin === input;
  }

  changePin(newPin: string): void {
    this.pin = newPin;
    this.record("PIN_CHANGE", 0);
  }

  private record(type: TransactionType, amount: number): void {
    this.transactions.push({
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      amount,
      date: new Date().toISOString(),
      balanceAfter: this.balance,
    });
  }
}