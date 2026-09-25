import type { ILogger } from '../domain/ILogger';
import { ViteTerminalLogger } from './ViteTerminalLogger';

export class LoggerFactory {
  private constructor() { }
  public static create(context: string): ILogger {
    return new ViteTerminalLogger(context);
  }
}
