"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorage = void 0;
// services/FileStorage.ts
const fs_1 = require("fs");
const AtmError_1 = require("../errors/AtmError");
class FileStorage {
    constructor(filePath) {
        this.filePath = filePath;
    }
    async loadAccounts() {
        try {
            const raw = await fs_1.promises.readFile(this.filePath, "utf-8");
            return JSON.parse(raw);
        }
        catch (err) {
            throw new AtmError_1.StorageError(`Could not read data file: ${err.message}`);
        }
    }
    async saveAccounts(accounts) {
        try {
            await fs_1.promises.writeFile(this.filePath, JSON.stringify(accounts, null, 2));
        }
        catch (err) {
            throw new AtmError_1.StorageError(`Could not save data: ${err.message}`);
        }
    }
}
exports.FileStorage = FileStorage;
