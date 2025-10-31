// src/presentation/menu/TestMenuProvider.test.ts

import { TestMenuProvider, TestMenuItem } from './TestMenuProvider';

describe('TestMenuProvider - Integration Tests', () => {
  let menuProvider: TestMenuProvider;

  beforeEach(() => {
    menuProvider = new TestMenuProvider();
  });

  describe('Menu Structure', () => {
    it('should provide 4 menu items', async () => {
      // Act
      const items = await menuProvider.getChildren();

      // Assert
      expect(items).toHaveLength(4);
    });

    it('should have Run Tests as first menu item', async () => {
      // Act
      const items = await menuProvider.getChildren();

      // Assert
      expect(items[0].label).toBe('▶️ Run Tests');
      expect(items[0].command?.command).toBe('TDD.runTest');
    });

    it('should have Crear Proyecto as second menu item', async () => {
      // Act
      const items = await menuProvider.getChildren();

      // Assert
      expect(items[1].label).toBe('📁 Crear Proyecto');
      expect(items[1].command?.command).toBe('TDD.cloneCommand');
    });

    it('should have Clear Terminal as third menu item', async () => {
      // Act
      const items = await menuProvider.getChildren();

      // Assert
      expect(items[2].label).toBe('🧹 Clear Terminal');
      expect(items[2].command?.command).toBe('TDD.clearTerminal');
    });

    it('should have Show Timeline as fourth menu item', async () => {
      // Act
      const items = await menuProvider.getChildren();

      // Assert
      expect(items[3].label).toBe('📊 Show Timeline');
      expect(items[3].command?.command).toBe('extension.showTimeline');
    });
  });

  describe('Menu Item Properties', () => {
    it('should create menu items with correct command structure', async () => {
      // Act
      const items = await menuProvider.getChildren();

      // Assert
      items.forEach(item => {
        expect(item.command).toBeDefined();
        expect(item.command?.command).toBeDefined();
        expect(item.command?.title).toBeDefined();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should trigger refresh event when refresh is called', () => {
      // Arrange
      const firespy = jest.fn();
      (menuProvider as any)._onDidChangeTreeData.fire = firespy;

      // Act
      menuProvider.refresh();

      // Assert
      expect(firespy).toHaveBeenCalledWith(undefined);
    });

    it('should return same tree structure after refresh', async () => {
      // Arrange
      const itemsBefore = await menuProvider.getChildren();

      // Act
      menuProvider.refresh();
      const itemsAfter = await menuProvider.getChildren();

      // Assert
      expect(itemsAfter).toHaveLength(itemsBefore.length);
      expect(itemsAfter[0].label).toBe(itemsBefore[0].label);
    });
  });

  describe('Tree Item Retrieval', () => {
    it('should return the same tree item when getTreeItem is called', async () => {
      // Arrange
      const items = await menuProvider.getChildren();
      const firstItem = items[0];

      // Act
      const retrievedItem = menuProvider.getTreeItem(firstItem);

      // Assert
      expect(retrievedItem).toBe(firstItem);
    });

    it('should return empty array for child elements', async () => {
      // Arrange
      const items = await menuProvider.getChildren();
      const firstItem = items[0];

      // Act
      const children = await menuProvider.getChildren(firstItem);

      // Assert
      expect(children).toEqual([]);
    });
  });

  describe('Command Validation', () => {
    it('should have valid command identifiers for all items', async () => {
      // Arrange
      const validCommands = [
        'TDD.runTest',
        'TDD.cloneCommand',
        'TDD.clearTerminal',
        'extension.showTimeline'
      ];

      // Act
      const items = await menuProvider.getChildren();

      // Assert
      items.forEach((item, index) => {
        expect(validCommands).toContain(item.command?.command);
      });
    });

    it('should have matching command and title for Run Tests', async () => {
      // Act
      const items = await menuProvider.getChildren();
      const runTestItem = items[0];

      // Assert
      expect(runTestItem.command?.command).toBe('TDD.runTest');
      expect(runTestItem.command?.title).toBe('Run Tests');
    });
  });

  describe('TestMenuItem Class', () => {
    it('should create TestMenuItem with label only', () => {
      // Act
      const item = new TestMenuItem('Test Label');

      // Assert
      expect(item.label).toBe('Test Label');
      expect(item.command).toBeUndefined();
    });

    it('should create TestMenuItem with label and command', () => {
      // Arrange
      const command = {
        command: 'test.command',
        title: 'Test Command'
      };

      // Act
      const item = new TestMenuItem('Test Label', command);

      // Assert
      expect(item.label).toBe('Test Label');
      expect(item.command).toBe(command);
    });

    it('should create TestMenuItem with custom collapsible state', () => {
      // Arrange
      const collapsibleState = 1; // Collapsed

      // Act
      const item = new TestMenuItem('Test Label', undefined, collapsibleState);

      // Assert
      expect(item.label).toBe('Test Label');
      expect(item.collapsibleState).toBe(collapsibleState);
    });
  });
});