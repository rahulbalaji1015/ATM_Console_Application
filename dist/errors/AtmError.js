"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageError = exports.InvalidAmountError = exports.AccountLockedError = exports.InvalidPinError = exports.InsufficientFundsError = exports.AtmError = void 0;
// errors/AtmErrors.ts
class AtmError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
    }
}
exports.AtmError = AtmError;
class InsufficientFundsError extends AtmError {
}
exports.InsufficientFundsError = InsufficientFundsError;
class InvalidPinError extends AtmError {
}
exports.InvalidPinError = InvalidPinError;
class AccountLockedError extends AtmError {
}
exports.AccountLockedError = AccountLockedError;
class InvalidAmountError extends AtmError {
}
exports.InvalidAmountError = InvalidAmountError;
class StorageError extends AtmError {
}
exports.StorageError = StorageError;
