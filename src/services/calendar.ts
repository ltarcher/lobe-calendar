import { Lunar } from 'lunar-typescript';
import type { CalendarResponseData, Festival } from '../type';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 法定节假日
const LEGAL_FESTIVALS = new Map<string, string>([
  ['01-01', '元旦'],
  ['05-01', '劳动节'],
  ['10-01', '国庆节'],
]);

// 传统节日（农历）
const TRADITIONAL_FESTIVALS = new Map<string, string>([
  ['01-01', '春节'],
  ['01-15', '元宵节'],
  ['05-05', '端午节'],
  ['08-15', '中秋节'],
  ['09-09', '重阳节'],
  ['12-08', '腊八节'],
]);

/**
 * 获取法定节日
 * @param month 月份（1-12）
 * @param day 日期（1-31）
 */
const getLegalFestivals = (month: number, day: number): Festival[] => {
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const festival = LEGAL_FESTIVALS.get(key);
  return festival ? [{ name: festival, type: 'legal' }] : [];
};

/**
 * 获取传统节日
 * @param lunarMonth 农历月份（1-12）
 * @param lunarDay 农历日期（1-30）
 */
const getTraditionalFestivals = (lunarMonth: number, lunarDay: number): Festival[] => {
  const key = `${lunarMonth.toString().padStart(2, '0')}-${lunarDay.toString().padStart(2, '0')}`;
  const festival = TRADITIONAL_FESTIVALS.get(key);
  return festival ? [{ name: festival, type: 'traditional' }] : [];
};

/**
 * 获取日历信息
 * @param dateStr ISO格式的日期字符串，如果不提供则使用当前日期
 */
export const getCalendarInfo = (dateStr?: string): CalendarResponseData => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const lunar = Lunar.fromDate(date);

  // 获取节日信息
  const festivals: Festival[] = [
    ...getLegalFestivals(date.getMonth() + 1, date.getDate()),
    ...getTraditionalFestivals(lunar.getMonth(), lunar.getDay()),
  ];

  return {
    date: date.toISOString().split('T')[0],
    lunar: {
      year: lunar.getYearInChinese() + '年',
      month: lunar.getMonthInChinese() + '月',
      day: lunar.getDayInChinese(),
      ganzhi: lunar.getYearInGanZhi(),
    },
    solarTerm: lunar.getJieQi(), // 获取节气
    festivals,
    weekDay: `星期${WEEKDAYS[date.getDay()]}`,
  };
};