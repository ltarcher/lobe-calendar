/**
 * 万年历插件状态接口
 * @typedef {Object} PluginState
 * @property {boolean} enabled - 插件启用状态，默认true
 * @property {string} version - 插件版本号，如'1.0.0'
 * @property {string} name - 插件名称，如'万年历'
 * @property {string} description - 插件功能描述
 * @property {Object} [config] - 插件显示配置
 * @property {boolean} [config.showBazi=true] - 是否显示四柱信息(年柱/月柱/日柱/时柱)
 * @property {boolean} [config.showSolarTerm=true] - 是否显示二十四节气
 * @property {boolean} [config.showFestivals=true] - 是否显示传统节日
 * @property {boolean} [config.showLunarDate=true] - 是否显示农历日期
 * @property {boolean} [config.showGregorianDate=true] - 是否显示公历日期
 * @example
 * // 基本用法
 * const state = {
 *   enabled: true,
 *   version: '1.0.0',
 *   name: '万年历',
 *   description: '提供农历、节气、节日和四柱信息',
 *   config: {
 *     showBazi: true,
 *     showSolarTerm: true
 *   }
 * }
 */
export interface PluginState {
  enabled: boolean;
  version: string;
  name: string;
  description: string;
  config?: {
    showBazi?: boolean;
    showSolarTerm?: boolean;
    showFestivals?: boolean;
    showLunarDate?: boolean;
    showGregorianDate?: boolean;
  };
}

export interface CalendarRequestData {
  date?: string; // ISO格式的日期字符串，如果不提供则使用当前日期
}

export interface Festival {
  name: string;
  type: 'traditional' | 'legal';
}

export interface BaziInfo {
  year: string;  // 年柱
  month: string; // 月柱
  day: string;   // 日柱
  hour: string;  // 时柱
}

export interface CalendarResponseData {
  date: string;          // 公历日期，ISO格式
  lunar: {
    year: string;        // 农历年，如"癸卯年"
    month: string;       // 农历月，如"腊月"
    day: string;         // 农历日，如"初十"
    ganzhi: string;      // 干支纪年
  };
  solarTerm?: string;    // 节气，如果当天有的话
  festivals: Festival[]; // 节日数组
  weekDay: string;      // 星期几
  bazi?: BaziInfo;      // 四柱信息
}