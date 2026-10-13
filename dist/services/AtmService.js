"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtmService = void 0;
const Account_1 = require("../models/Account");
class AccountLockedError extends Error {
    constructor(message) {
        super(message);
        this.name = "AccountLockedError";
    }
}
class InvalidPinError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidPinError";
    }
}
const MAX_ATTEMPTS = 3;
class AtmService {
    constructor(storage) {
        this.storage = storage;
        this.accounts = [];
        this.failedAttempts = new Map(); // cardNumber -> wrong tries
    }
    // Load accounts from the file once at startup
    async init() {
        const data = await this.storage.loadAccounts();
        this.accounts = data.map((a) => new Account_1.Account(a));
    }
    async login(cardNumber, pin) {
        const account = this.accounts.find((a) => a.cardNumber === cardNumber);
        // Same message for unknown card and wrong PIN (does not reveal which)
        if (!account)
            throw new InvalidPinError("Invalid card number or PIN.");
        if (account.isLocked) {
            throw new AccountLockedError("This card is locked. Please contact the bank.");
        }
        if (!account.verifyPin(pin)) {
            const attempts = (this.failedAttempts.get(cardNumber) ?? 0) + 1;
            this.failedAttempts.set(cardNumber, attempts);
            if (attempts >= MAX_ATTEMPTS) {
                account.isLocked = true;
                await this.save(); // lock is stored in the JSON file
                throw new AccountLockedError("Card locked after 3 wrong PIN attempts.");
            }
            throw new InvalidPinError(`Wrong PIN. ${MAX_ATTEMPTS - attempts} attempt(s) left.`);
        }
        this.failedAttempts.delete(cardNumber); // reset on success
        return account;
    }
    getBalance(account) {
        return account.balance;
    }
    async deposit(account, amount) {
        account.deposit(amount); // validation lives in Account
        await this.save();
    }
    async withdraw(account, amount) {
        account.withdraw(amount); // checks multiple of 100 and balance
        await this.save();
    }
    getMiniStatement(account, count = 5) {
        return account.transactions.slice(-count).reverse(); // newest first
    }
    async changePin(account, oldPin, newPin) {
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
    // Write all accounts back to data/accounts.json
    async save() {
        await this.storage.saveAccounts(this.accounts);
    }
}
exports.AtmService = AtmService;
