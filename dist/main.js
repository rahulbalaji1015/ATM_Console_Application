"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileStorage_1 = require("./services/FileStorage");
const AtmService_1 = require("./services/AtmService");
const ConsoleUI_1 = require("./ui/ConsoleUI");
async function main() {
    const storage = new FileStorage_1.FileStorage("data/accounts.json");
    const atm = new AtmService_1.AtmService(storage);
    const ui = new ConsoleUI_1.ConsoleUI();
    try {
        await atm.init();
        // login flow, then menu loop
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ ${message}`);
    }
    finally {
        ui.close();
    }
}
main();
