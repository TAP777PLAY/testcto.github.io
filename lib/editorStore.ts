import { create } from 'zustand';
import { Block } from '@/components/BlockEditor';

type HistoryState = {
  blocks: Block[];
  timestamp: number;
};

type EditorStore = {
  blocks: Block[];
  history: HistoryState[];
  historyIndex: number;
  selectedBlockId: string | null;
  previewMode: boolean;
  
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (blocks: Block[]) => void;
  
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  setSelectedBlock: (blockId: string | null) => void;
  togglePreview: () => void;
  
  initializeHistory: (blocks: Block[]) => void;
  addToHistory: (blocks: Block[]) => void;
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  blocks: [],
  history: [],
  historyIndex: -1,
  selectedBlockId: null,
  previewMode: false,
  
  setBlocks: (blocks) => {
    set({ blocks });
  },
  
  addBlock: (block) => {
    const newBlocks = [...get().blocks, block];
    set({ blocks: newBlocks });
    get().addToHistory(newBlocks);
  },
  
  updateBlock: (blockId, updates) => {
    const newBlocks = get().blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    set({ blocks: newBlocks });
    get().addToHistory(newBlocks);
  },
  
  deleteBlock: (blockId) => {
    const newBlocks = get().blocks.filter(block => block.id !== blockId);
    set({ blocks: newBlocks });
    get().addToHistory(newBlocks);
  },
  
  reorderBlocks: (blocks) => {
    set({ blocks });
    get().addToHistory(blocks);
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        blocks: history[newIndex].blocks,
        historyIndex: newIndex,
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        blocks: history[newIndex].blocks,
        historyIndex: newIndex,
      });
    }
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
  
  togglePreview: () => set({ previewMode: !get().previewMode }),
  
  initializeHistory: (blocks) => {
    set({
      blocks,
      history: [{ blocks, timestamp: Date.now() }],
      historyIndex: 0,
    });
  },
  
  addToHistory: (blocks) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks, timestamp: Date.now() });
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
}));
