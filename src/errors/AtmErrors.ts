export class AtmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
export class InsufficientFundsError extends AtmError {}
export class InvalidPinError extends AtmError {}
export class AccountLockedError extends AtmError {}
export class InvalidAmountError extends AtmError {}
export class StorageError extends AtmError {}