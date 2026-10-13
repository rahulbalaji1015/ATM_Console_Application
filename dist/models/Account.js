"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const AtmError_1 = require("../errors/AtmError");
class Account {
    constructor(data) {
        Object.assign(this, data);
    }
    deposit(amount) {
        if (amount <= 0)
            throw new AtmError_1.InvalidAmountError("Amount must be positive.");
        this.balance += amount;
        this.record("DEPOSIT", amount);
    }
    withdraw(amount) {
        if (amount <= 0 || amount % 100 !== 0)
            throw new AtmError_1.InvalidAmountError("Enter a positive multiple of 100.");
        if (amount > this.balance)
            throw new AtmError_1.InsufficientFundsError("Insufficient balance.");
        this.balance -= amount;
        this.record("WITHDRAW", amount);
    }
    verifyPin(input) {
        return this.pin === input;
    }
    changePin(newPin) {
        this.pin = newPin;
        this.record("PIN_CHANGE", 0);
    }
    record(type, amount) {
        this.transactions.push({
            id: Date.now().toString(),
            type,
            amount,
            date: new Date().toISOString(),
            balanceAfter: this.balance,
        });
    }
}
exports.Account = Account;
