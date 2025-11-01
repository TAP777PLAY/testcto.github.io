import { BlockDefinition } from './types';

class BlockRegistry {
  private blocks: Map<string, { plugin: string; definition: BlockDefinition }> = new Map();

  register(pluginSlug: string, definition: BlockDefinition): void {
    if (this.blocks.has(definition.type)) {
      console.warn(`Block type ${definition.type} is already registered`);
      return;
    }

    this.blocks.set(definition.type, { plugin: pluginSlug, definition });
  }

  unregister(blockType: string): void {
    this.blocks.delete(blockType);
  }

  unregisterByPlugin(pluginSlug: string): void {
    for (const [type, block] of this.blocks.entries()) {
      if (block.plugin === pluginSlug) {
        this.blocks.delete(type);
      }
    }
  }

  get(blockType: string): BlockDefinition | undefined {
    return this.blocks.get(blockType)?.definition;
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values()).map((b) => b.definition);
  }

  getAllByPlugin(pluginSlug: string): BlockDefinition[] {
    return Array.from(this.blocks.values())
      .filter((b) => b.plugin === pluginSlug)
      .map((b) => b.definition);
  }

  has(blockType: string): boolean {
    return this.blocks.has(blockType);
  }
}

export const blockRegistry = new BlockRegistry();
