import * as readline from "readline";
import { stdin as input, stdout as output } from "process";

export class ConsoleUI {
  private rl = readline.createInterface({ input, output });

  ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  close(): void {
    this.rl.close();
  }
}