import terminal from "virtual:terminal";
import pc from "picocolors";
import type { ILogger } from "../domain/ILogger";

export class ViteTerminalLogger implements ILogger {
  private readonly context: string;

  constructor(name: string) {
    this.context = name;
  }

  private formatHeader(
    level: string,
    formatLevel: (str: string) => string,
  ): string {
    const time = pc.dim(new Date().toLocaleTimeString());
    const tag = pc.cyan(pc.bold(`[${this.context}]`));
    const lvl = formatLevel(level.padEnd(5));

    return `${time} ${lvl} ${tag}`;
  }

  log(...args: unknown[]): void {
    terminal.log(this.formatHeader("LOG", pc.green), ...args);
  }

  info(...args: unknown[]): void {
    terminal.info(this.formatHeader("INFO", pc.blue), ...args);
  }

  warn(...args: unknown[]): void {
    terminal.warn(this.formatHeader("WARN", pc.yellow), ...args);
  }

  error(...args: unknown[]): void {
    terminal.error(
      this.formatHeader("ERROR", (s) => pc.red(pc.bold(s))),
      ...args,
    );
  }
}
