import { Lunar } from 'lunar-typescript';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { CalendarResponseData, Festival } from '../type';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

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
 * @param timeStr 时间字符串(HH:mm格式)，用于计算时柱
 */
export const getCalendarInfo = (data: CalendarRequestData): CalendarResponseData => {
  const { date: dateStr, time: timeStr, timezone = 'Asia/Shanghai', config } = data;
  
  // 修复日期解析，正确处理时区
  const parseDate = (dateStr?: string, tz = timezone) => {
    if (!dateStr) return dayjs().tz(tz).toDate();
    
    // 处理YYYY-MM-DD格式，使用指定时区
    return dayjs.tz(dateStr, tz).toDate();
  };
  
  const date = parseDate(dateStr);
  const lunar = Lunar.fromDate(date);

  // 获取节日信息
  const festivals: Festival[] = [
    ...getLegalFestivals(date.getMonth() + 1, date.getDate()),
    ...getTraditionalFestivals(lunar.getMonth(), lunar.getDay()),
  ];

  // 计算四柱
  const bazi = {
    year: lunar.getYearInGanZhi(),
    month: lunar.getMonthInGanZhi(),
    day: lunar.getDayInGanZhi(),
    hour: timeStr ? lunar.getTimeGan() + lunar.getTimeZhi() : '未知' // 组合天干地支
  };

  // 获取年份的干支表示
  const yearGanZhi = lunar.getYearInGanZhi();

  return {
    date: date.toISOString().split('T')[0],
    lunar: {
      year: yearGanZhi + '年',
      month: lunar.getMonthInChinese() + '月',
      day: lunar.getDayInChinese(),
      ganzhi: yearGanZhi,
    },
    solarTerm: lunar.getJieQi(), // 获取节气
    festivals,
    weekDay: `星期${WEEKDAYS[date.getDay()]}`,
    bazi,
  };
};