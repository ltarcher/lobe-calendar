import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getPluginState, 
  updatePluginState, 
  resetPluginState, 
  togglePluginEnabled 
} from '../plugin';

// 增强的localStorage模拟
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      console.log(`[Mock] Getting ${key}:`, store[key] || null);
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      console.log(`[Mock] Setting ${key}:`, value);
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      console.log(`[Mock] Removing ${key}`);
      delete store[key];
    },
    clear: () => {
      console.log('[Mock] Clearing storage');
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

describe('插件状态服务', () => {
  beforeEach(() => {
    // 在每个测试前清空localStorage
    localStorageMock.clear();
    // 模拟window.localStorage
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('应返回默认状态', () => {
    const state = getPluginState();
    expect(state.enabled).toBe(true);
    expect(state.version).toBe('1.0.0');
    expect(state.config?.showBazi).toBe(true);
  });

  it('应更新插件状态', () => {
    // 重置状态确保测试独立
    resetPluginState();
    
    const initialState = getPluginState();
    console.log('初始状态:', initialState);
    
    const newState = updatePluginState({ 
      enabled: false,
      config: { showBazi: false }
    });
    console.log('更新后状态:', newState);
    
    const storedState = JSON.parse(localStorageMock.getItem('wnl_plugin_state') || '{}');
    console.log('存储的状态:', storedState);
    
    expect(newState.enabled).toBe(false);
    expect(newState.config?.showBazi).toBe(false);
    expect(newState.config?.showSolarTerm).toBe(true);
  });

  it('应重置插件状态', () => {
    updatePluginState({ enabled: false });
    const resetState = resetPluginState();
    
    expect(resetState.enabled).toBe(true);
  });

  it('应切换插件启用状态', () => {
    const initialState = getPluginState();
    const state1 = togglePluginEnabled();
    expect(state1.enabled).toBe(!initialState.enabled);
    
    const state2 = togglePluginEnabled();
    expect(state2.enabled).toBe(initialState.enabled);
  });
});