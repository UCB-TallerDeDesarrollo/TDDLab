import { TerminalInput, TerminalOutput } from '../repositories/TerminalIOInterface';

export class TerminalService {
  private command = '';

  constructor(
    private readonly input: TerminalInput,
    private readonly output: TerminalOutput
  ) {}

  start(): void {
    this.output.write('Bienvenido a la terminal simulada. Escribe "help" para ver comandos.');
    this.output.prompt();

    this.input.onInput(data => this.handleInput(data));
  }

  private handleInput(data: string): void {
    const code = data.charCodeAt(0);

    if (code === 13) {
      this.executeCommand(this.command.trim());
      this.command = '';
    } else if (code === 127) {
      if (this.command.length > 0) {
        this.command = this.command.slice(0, -1);
        this.output.write('\b \b');
      }
    } else if (code >= 32 && code <= 126) {
      this.command += data;
      this.output.write(data);
    }
  }

  private executeCommand(cmd: string): void {
    switch (cmd) {
      case 'help':
        this.output.write('\r\nComandos disponibles: help, clear, echo, about');
        break;
      case 'clear':
        this.output.clear();
        break;
      case 'about':
        this.output.write('\r\nEsta es una consola simulada hecha con xterm.js');
        break;
      case '':
        break;
      default:
        if (cmd.startsWith('echo ')) {
          this.output.write('\r\n' + cmd.slice(5));
        } else {
          this.output.write(`\r\nComando no reconocido: ${cmd}`);
        }
        break;
    }
    this.output.prompt();
  }
}
