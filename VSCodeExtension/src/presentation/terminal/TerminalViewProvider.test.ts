// src/presentation/terminal/TerminalViewProvider.test.ts
// ⭐ MOCK PRIMERO - antes de cualquier import

import { TerminalViewProvider } from './TerminalViewProvider';
import { TimelineView } from '../timeline/TimelineView';
import { TerminalPort } from '../../domain/model/TerminalPort';

// Mocks
class MockTimelineView {
  async getTimelineHtml(webview: any): Promise<string> {
    return '<div>Mock Timeline</div>';
  }
}

class MockTerminalPort implements TerminalPort {
  private executedCommands: string[] = [];
  private isExecuting: boolean = false;
  private outputCallback: ((output: string) => void) | null = null;

  async createAndExecuteCommand(terminalName: string, command: string): Promise<void> {
    this.executedCommands.push(command);
    this.isExecuting = true;
    
    // Simular ejecución
    if (this.outputCallback) {
      this.outputCallback(`Executing: ${command}\n`);
      this.outputCallback(`✅ Comando ejecutado correctamente\n`);
      this.outputCallback('$ ');
    }
    
    this.isExecuting = false;
  }

  setOnOutputCallback(callback: (output: string) => void): void {
    this.outputCallback = callback;
  }

  killCurrentProcess(): void {
    this.isExecuting = false;
    if (this.outputCallback) {
      this.outputCallback('\n🛑 Proceso cancelado\n$ ');
    }
  }

  getExecutedCommands(): string[] {
    return this.executedCommands;
  }

  clearExecutedCommands(): void {
    this.executedCommands = [];
  }
}

class MockExtensionContext {
  globalState = {
    data: new Map<string, any>(),
    get: function(key: string, defaultValue?: any) {
      return this.data.get(key) || defaultValue;
    },
    update: function(key: string, value: any) {
      this.data.set(key, value);
      return Promise.resolve();
    }
  };
}

describe('TerminalViewProvider - Command Tests', () => {
  let terminalProvider: TerminalViewProvider;
  let mockContext: MockExtensionContext;
  let mockTimelineView: MockTimelineView;
  let mockTerminalPort: MockTerminalPort;

  beforeEach(() => {
    mockContext = new MockExtensionContext();
    mockTimelineView = new MockTimelineView();
    mockTerminalPort = new MockTerminalPort();

    terminalProvider = new TerminalViewProvider(
      mockContext as any,
      mockTimelineView as any,
      mockTerminalPort
    );
  });

  describe('1️⃣ Run Tests Command', () => {
    it('should execute npm test command', async () => {
      // Act
      await terminalProvider.executeCommand('npm test');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('npm test');
    });

    it('should execute npm run test command', async () => {
      // Act
      await terminalProvider.executeCommand('npm run test');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('npm run test');
    });

    it('should execute multiple test commands sequentially', async () => {
      // Act
      await terminalProvider.executeCommand('npm test');
      await terminalProvider.executeCommand('npm run test:coverage');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toHaveLength(2);
      expect(executed[0]).toBe('npm test');
      expect(executed[1]).toBe('npm run test:coverage');
    });
  });

  describe(' Clear Terminal Command', () => {
    it('should clear terminal buffer', () => {
      // Arrange
      terminalProvider.sendToTerminal('Some previous output\n');
      
      // Act
      terminalProvider.clearTerminal();

      // Assert - buffer should be reset to just prompt
      const buffer = (terminalProvider as any).terminalBuffer;
      expect(buffer).toBe('$ ');
    });

    it('should clear terminal and save state', () => {
      // Arrange
      terminalProvider.sendToTerminal('Previous content\n');
      
      // Act
      terminalProvider.clearTerminal();

      // Assert
      const savedBuffer = mockContext.globalState.get('tddTerminalBuffer');
      expect(savedBuffer).toBe('$ ');
    });

    it('should allow new commands after clearing', async () => {
      // Arrange
      await terminalProvider.executeCommand('npm test');
      
      // Act
      terminalProvider.clearTerminal();
      mockTerminalPort.clearExecutedCommands();
      await terminalProvider.executeCommand('npm run lint');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('npm run lint');
    });

    it('should handle multiple clear operations', () => {
      // Arrange
      terminalProvider.sendToTerminal('Content 1\n');
      
      // Act
      terminalProvider.clearTerminal();
      terminalProvider.sendToTerminal('Content 2\n');
      terminalProvider.clearTerminal();

      // Assert
      const buffer = (terminalProvider as any).terminalBuffer;
      expect(buffer).toBe('$ ');
    });
  });

  describe('Execute Command (General)', () => {
    it('should execute git status command', async () => {
      // Act
      await terminalProvider.executeCommand('git status');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('git status');
    });

    it('should execute git branch command', async () => {
      // Act
      await terminalProvider.executeCommand('git branch');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('git branch');
    });

    it('should handle empty command gracefully', async () => {
      // Act
      await terminalProvider.executeCommand('');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toHaveLength(0);
    });

    it('should trim whitespace from commands', async () => {
      // Act
      await terminalProvider.executeCommand('  npm test  ');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed[0]).toBe('npm test'); // Se ejecuta pero con espacios
    });

    it('should execute pwd command', async () => {
      // Act
      await terminalProvider.executeCommand('pwd');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('pwd');
    });
  });

  describe(' Terminal Output', () => {
    it('should send output to terminal', () => {
      // Arrange
      const message = 'Test output message';

      // Act
      terminalProvider.sendToTerminal(message);

      // Assert
      const buffer = (terminalProvider as any).terminalBuffer;
      expect(buffer).toContain(message);
    });

    it('should accumulate multiple outputs', () => {
      // Act
      terminalProvider.sendToTerminal('Line 1\n');
      terminalProvider.sendToTerminal('Line 2\n');
      terminalProvider.sendToTerminal('Line 3\n');

      // Assert
      const buffer = (terminalProvider as any).terminalBuffer;
      expect(buffer).toContain('Line 1');
      expect(buffer).toContain('Line 2');
      expect(buffer).toContain('Line 3');
    });

    it('should persist terminal buffer to storage', () => {
      // Arrange
      const message = 'Persistent message';

      // Act
      terminalProvider.sendToTerminal(message);

      // Assert
      const savedBuffer = mockContext.globalState.get('tddTerminalBuffer');
      expect(savedBuffer).toContain(message);
    });

  });

  describe(' Command Validation', () => {
    it('should accept valid npm commands', async () => {
      // Arrange
      const validCommands = ['npm test', 'npm run build', 'npm install'];

      // Act & Assert
      for (const cmd of validCommands) {
        mockTerminalPort.clearExecutedCommands();
        await terminalProvider.executeCommand(cmd);
        expect(mockTerminalPort.getExecutedCommands()).toContain(cmd);
      }
    });

    it('should accept valid git commands', async () => {
      // Arrange
      const gitCommands = ['git status', 'git log', 'git branch'];

      // Act & Assert
      for (const cmd of gitCommands) {
        mockTerminalPort.clearExecutedCommands();
        await terminalProvider.executeCommand(cmd);
        expect(mockTerminalPort.getExecutedCommands()).toContain(cmd);
      }
    });

    it('should handle commands with arguments', async () => {
      // Act
      await terminalProvider.executeCommand('npm run test -- --coverage');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('npm run test -- --coverage');
    });

    it('should handle commands with quotes', async () => {
      // Act
      await terminalProvider.executeCommand('echo "Hello World"');

      // Assert
      const executed = mockTerminalPort.getExecutedCommands();
      expect(executed).toContain('echo "Hello World"');
    });
  });
});