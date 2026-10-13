import { FileStorage } from "./services/FileStorage";
import { AtmService } from "./services/AtmService";
import { ConsoleUI } from "./ui/ConsoleUI";
import { Account } from "./models/Account";
import {
  AtmError,
  AccountLockedError,
  InvalidAmountError,
} from "./errors/AtmErrors";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function askAmount(ui: ConsoleUI, label: string): Promise<number> {
  const raw = (await ui.ask(label)).trim();
  const n = Number(raw);
  if (raw === "" || Number.isNaN(n)) {
    throw new InvalidAmountError("Please enter a valid number.");
  }
  return n;
}

async function login(atm: AtmService, ui: ConsoleUI): Promise<Account | null> {
  while (true) {
    const card = (await ui.ask("\nCard number (or 'exit'): ")).trim();
    if (card.toLowerCase() === "exit") return null;

    const pin = (await ui.ask("PIN: ")).trim();

    try {
      const user = await atm.login(card, pin);
      console.log(`\n✅ Welcome, ${user.holderName}!`);
      return user;
    } catch (err) {
      if (err instanceof AccountLockedError) {
        console.log(`❌ ${err.message}`);
        return null; // card locked: end the session
      }
      if (err instanceof AtmError) {
        console.log(`❌ ${err.message}`);
      } else {
        throw err;
      }
    }
  }
}

async function menu(atm: AtmService, ui: ConsoleUI, user: Account): Promise<void> {
  while (true) {
    console.log(`
===== ATM MENU =====
1. Check Balance
2. Deposit
3. Withdraw
4. Mini Statement
5. Change PIN
6. Exit`);

    const choice = (await ui.ask("Choose an option: ")).trim();

    try {
      switch (choice) {
        case "1":
          console.log(`💰 Balance: ₹${atm.getBalance(user)}`);
          break;

        case "2": {
          const amount = await askAmount(ui, "Deposit amount: ");
          console.log("Processing...");
          await sleep(1000);
          await atm.deposit(user, amount);
          console.log(`✅ Deposited ₹${amount}. New balance: ₹${user.balance}`);
          break;
        }

        case "3": {
          const amount = await askAmount(ui, "Withdraw amount (multiples of 100): ");
          console.log("Processing...");
          await sleep(1000);
          await atm.withdraw(user, amount);
          console.log(`✅ Please collect ₹${amount}. New balance: ₹${user.balance}`);
          break;
        }

        case "4": {
          const txns = atm.getMiniStatement(user);
          if (txns.length === 0) {
            console.log("No transactions yet.");
          } else {
            console.log("\n--- Last transactions (newest first) ---");
            txns.forEach((t) =>
              console.log(
                `${t.date.slice(0, 10)} | ${t.type.padEnd(10)} | ₹${t.amount} | Balance: ₹${t.balanceAfter}`
              )
            );
          }
          break;
        }

        case "5": {
          const oldPin = (await ui.ask("Current PIN: ")).trim();
          const newPin = (await ui.ask("New 4-digit PIN: ")).trim();
          await atm.changePin(user, oldPin, newPin);
          console.log("✅ PIN changed successfully.");
          break;
        }

        case "6":
          console.log("Thank you for using our ATM. Goodbye!");
          return;

        default:
          console.log("Invalid option, please choose 1 to 6.");
      }
    } catch (err) {
      // One error should not crash the whole app
      if (err instanceof AtmError) {
        console.log(`❌ ${err.message}`);
      } else {
        console.log("Unexpected error:", err instanceof Error ? err.message : err);
      }
    }
  }
}

async function main() {
  const storage = new FileStorage("data/accounts.json");
  const atm = new AtmService(storage);
  const ui = new ConsoleUI();

  try {
    await atm.init();
    console.log("===== WELCOME TO THE ATM =====");

    const user = await login(atm, ui);
    if (user) {
      await menu(atm, ui, user);
    } else {
      console.log("Session ended.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ ${message}`);
  } finally {
    ui.close();
  }
}

main();