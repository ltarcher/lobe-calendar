export interface PluginState {
  enabled: boolean;           // 插件是否启用
  version: string;            // 插件版本
  name: string;              // 插件名称
  description: string;        // 插件描述
  config?: {                 // 插件配置
    showBazi?: boolean;      // 是否显示四柱信息
    showSolarTerm?: boolean; // 是否显示节气
    showFestivals?: boolean; // 是否显示节日
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