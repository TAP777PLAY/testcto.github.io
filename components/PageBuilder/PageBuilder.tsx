'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/lib/editorStore';
import { BlockPanel } from './BlockPanel';
import { Canvas } from './Canvas';
import { SettingsPanel } from './SettingsPanel';
import { Toolbar } from './Toolbar';
import { Block } from '../BlockEditor';

type PageBuilderProps = {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => Promise<void>;
  onAddBlock: (type: string) => Promise<Block>;
  onDeleteBlock: (blockId: string) => Promise<void>;
};

export function PageBuilder({ initialBlocks, onSave, onAddBlock, onDeleteBlock }: PageBuilderProps) {
  const {
    blocks,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    selectedBlockId,
    initializeHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  useEffect(() => {
    initializeHistory(initialBlocks);
  }, [initialBlocks, initializeHistory]);

  const handleSave = async () => {
    await onSave(blocks);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave]);

  useEffect(() => {
    if (blocks.length > 0 && blocks !== initialBlocks) {
      const timeoutId = setTimeout(() => {
        onSave(blocks);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [blocks, initialBlocks, onSave]);

  const handleAddBlock = async (type: string) => {
    const newBlock = await onAddBlock(type);
    useEditorStore.getState().addBlock(newBlock);
  };

  const handleUpdateBlocks = (updatedBlocks: Block[]) => {
    reorderBlocks(updatedBlocks);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    updateBlock(blockId, updates);
  };

  const handleDeleteBlock = async (blockId: string) => {
    await onDeleteBlock(blockId);
    deleteBlock(blockId);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar onSave={handleSave} canUndo={canUndo()} canRedo={canRedo()} />
      
      <div className="flex flex-1 overflow-hidden">
        <BlockPanel onAddBlock={handleAddBlock} />
        
        <Canvas
          blocks={blocks}
          onUpdateBlocks={handleUpdateBlocks}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
        />
        
        <SettingsPanel
          selectedBlock={selectedBlock}
          onUpdateBlock={handleUpdateBlock}
        />
      </div>
    </div>
  );
}
