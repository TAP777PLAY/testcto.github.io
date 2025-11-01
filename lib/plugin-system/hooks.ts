import { HookCallback, FilterCallback } from './types';

type HookEntry = {
  callback: HookCallback;
  priority: number;
};

type FilterEntry = {
  callback: FilterCallback;
  priority: number;
};

class HookSystem {
  private actions: Map<string, HookEntry[]> = new Map();
  private filters: Map<string, FilterEntry[]> = new Map();

  addAction(hookName: string, callback: HookCallback, priority: number = 10): void {
    if (!this.actions.has(hookName)) {
      this.actions.set(hookName, []);
    }

    const hooks = this.actions.get(hookName)!;
    hooks.push({ callback, priority });
    hooks.sort((a, b) => a.priority - b.priority);
  }

  removeAction(hookName: string, callback: HookCallback): void {
    const hooks = this.actions.get(hookName);
    if (hooks) {
      const filtered = hooks.filter((h) => h.callback !== callback);
      this.actions.set(hookName, filtered);
    }
  }

  async doAction(hookName: string, ...args: any[]): Promise<void> {
    const hooks = this.actions.get(hookName);
    if (hooks) {
      for (const hook of hooks) {
        try {
          await hook.callback(...args);
        } catch (error) {
          console.error(`Error in action hook ${hookName}:`, error);
        }
      }
    }
  }

  hasAction(hookName: string): boolean {
    return this.actions.has(hookName) && this.actions.get(hookName)!.length > 0;
  }

  addFilter(filterName: string, callback: FilterCallback, priority: number = 10): void {
    if (!this.filters.has(filterName)) {
      this.filters.set(filterName, []);
    }

    const filters = this.filters.get(filterName)!;
    filters.push({ callback, priority });
    filters.sort((a, b) => a.priority - b.priority);
  }

  removeFilter(filterName: string, callback: FilterCallback): void {
    const filters = this.filters.get(filterName);
    if (filters) {
      const filtered = filters.filter((f) => f.callback !== callback);
      this.filters.set(filterName, filtered);
    }
  }

  async applyFilters(filterName: string, value: any, ...args: any[]): Promise<any> {
    const filters = this.filters.get(filterName);
    if (!filters) {
      return value;
    }

    let result = value;
    for (const filter of filters) {
      try {
        result = await filter.callback(result, ...args);
      } catch (error) {
        console.error(`Error in filter ${filterName}:`, error);
      }
    }

    return result;
  }

  hasFilter(filterName: string): boolean {
    return this.filters.has(filterName) && this.filters.get(filterName)!.length > 0;
  }

  clear(): void {
    this.actions.clear();
    this.filters.clear();
  }

  clearAction(hookName: string): void {
    this.actions.delete(hookName);
  }

  clearFilter(filterName: string): void {
    this.filters.delete(filterName);
  }
}

export const hookSystem = new HookSystem();

export const addAction = hookSystem.addAction.bind(hookSystem);
export const removeAction = hookSystem.removeAction.bind(hookSystem);
export const doAction = hookSystem.doAction.bind(hookSystem);
export const hasAction = hookSystem.hasAction.bind(hookSystem);

export const addFilter = hookSystem.addFilter.bind(hookSystem);
export const removeFilter = hookSystem.removeFilter.bind(hookSystem);
export const applyFilters = hookSystem.applyFilters.bind(hookSystem);
export const hasFilter = hookSystem.hasFilter.bind(hookSystem);
