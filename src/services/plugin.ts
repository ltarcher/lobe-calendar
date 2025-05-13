import { PluginState } from '../type';

// 默认插件状态
const defaultPluginState: PluginState = {
  enabled: true,
  version: '1.0.0',
  name: '万年历',
  description: '提供农历、节气、节日和四柱信息',
  config: {
    showBazi: true,
    showSolarTerm: true,
    showFestivals: true,
  },
};

// 存储插件状态的键名
const PLUGIN_STATE_KEY = 'wnl_plugin_state';

/**
 * 获取插件状态
 * @returns 插件状态对象
 */
export const getPluginState = (): PluginState => {
  if (typeof window === 'undefined') {
    return defaultPluginState;
  }

  const savedState = localStorage.getItem(PLUGIN_STATE_KEY);
  if (!savedState) {
    return defaultPluginState;
  }

  try {
    return JSON.parse(savedState) as PluginState;
  } catch (error) {
    console.error('解析插件状态失败:', error);
    return defaultPluginState;
  }
};

/**
 * 更新插件状态
 * @param state 要更新的状态对象或部分状态
 * @returns 更新后的插件状态
 */
export const updatePluginState = (state: Partial<PluginState>): PluginState => {
  if (typeof window === 'undefined') {
    return defaultPluginState;
  }

  const currentState = getPluginState();
  const newState = {
    ...currentState,
    ...state,
    config: state.config ? { ...currentState.config, ...state.config } : currentState.config
  };

  localStorage.setItem(PLUGIN_STATE_KEY, JSON.stringify(newState));
  return newState;
};

/**
 * 重置插件状态为默认值
 * @returns 重置后的插件状态
 */
export const resetPluginState = (): PluginState => {
  if (typeof window === 'undefined') {
    return defaultPluginState;
  }

  localStorage.setItem(PLUGIN_STATE_KEY, JSON.stringify(defaultPluginState));
  return defaultPluginState;
};

/**
 * 切换插件启用状态
 * @returns 更新后的插件状态
 */
export const togglePluginEnabled = (): PluginState => {
  if (typeof window === 'undefined') {
    return defaultPluginState;
  }

  const currentState = getPluginState();
  const newState = {
    ...currentState,
    enabled: !currentState.enabled
  };

  localStorage.setItem(PLUGIN_STATE_KEY, JSON.stringify(newState));
  return newState;
};