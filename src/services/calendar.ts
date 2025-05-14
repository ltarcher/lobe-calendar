import { Lunar, Solar } from 'lunar-typescript';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { 
  CalendarRequestData, 
  CalendarResponseData, 
  Festival,
  SolarTermRequestData,
  LunarToSolarRequestData 
} from '../type';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 法定节假日
const LEGAL_FESTIVALS = new Map<string, string>([
  ['01-01', '元旦'],
  ['02-14', '情人节'],
  ['03-08', '妇女节'],
  ['04-01', '愚人节'],
  ['05-01', '劳动节'],
  ['05-04', '青年节'],
  ['06-01', '儿童节'],
  ['09-10', '教师节'],
  ['10-01', '国庆节'],
  ['12-24', '平安夜'],
  ['12-25', '圣诞节'],
]);

// 传统节日（农历）
const TRADITIONAL_FESTIVALS = new Map<string, string>([
  ['01-01', '春节'],
  ['01-15', '元宵节'],
  ['02-02', '龙抬头'],
  ['03-03', '上巳节'],
  ['05-05', '端午节'],
  ['06-06', '天贶节'],
  ['07-07', '七夕节'],
  ['07-15', '中元节'],
  ['08-15', '中秋节'],
  ['09-09', '重阳节'],
  ['10-15', '下元节'],
  ['12-08', '腊八节'],
  ['12-23', '小年'],
]);

// 特殊节日（非固定日期）
const SPECIAL_FESTIVALS = [
  { name: '母亲节', month: 5, week: 2, dayOfWeek: 0 }, // 5月第二个周日
  { name: '父亲节', month: 6, week: 3, dayOfWeek: 0 }, // 6月第三个周日
  { name: '感恩节', month: 11, week: 4, dayOfWeek: 4 } // 11月第四个周四
];

/**
 * 获取法定节日
 * @param month 月份（1-12）
 * @param day 日期（1-31）
 * @param year 年份（用于计算特殊节日）
 */
const getLegalFestivals = (month: number, day: number, year?: number): Festival[] => {
  const festivals: Festival[] = [];
  
  // 固定日期的法定节日
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const festival = LEGAL_FESTIVALS.get(key);
  if (festival) {
    festivals.push({ name: festival, type: 'legal' });
  }

  // 特殊节日（需要年份计算）
  if (year) {
    for (const special of SPECIAL_FESTIVALS) {
      if (month === special.month) {
        // 计算指定月份第n个星期x的日期
        const date = getNthWeekdayOfMonth(year, special.month, special.week, special.dayOfWeek);
        if (date.getDate() === day) {
          festivals.push({ name: special.name, type: 'legal' });
        }
      }
    }
  }

  return festivals;
};

/**
 * 获取某个月的第n个星期x的日期
 * @param year 年份
 * @param month 月份（1-12）
 * @param week 第几周（1-5）
 * @param dayOfWeek 星期几（0-6，0表示周日）
 */
const getNthWeekdayOfMonth = (year: number, month: number, week: number, dayOfWeek: number): Date => {
  let date = new Date(year, month - 1, 1);
  let count = 0;
  
  while (date.getMonth() === month - 1) {
    if (date.getDay() === dayOfWeek) {
      count++;
      if (count === week) {
        return date;
      }
    }
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return date;
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
/**
 * 获取指定节气在给定年份的公历日期
 */
export const getSolarTermDate = (data: SolarTermRequestData): string => {
  const { name, year, timezone = 'Asia/Shanghai' } = data;
  const targetYear = year || dayjs().tz(timezone).year();
  
  // 查找该节气在目标年份的日期
  for (let month = 0; month < 12; month++) {
    const date = new Date(targetYear, month, 1);
    const lunar = Solar.fromDate(date).getLunar();
    const solarTerm = lunar.getJieQi();
    
    if (solarTerm === name) {
      return dayjs(date).tz(timezone).format('YYYY-MM-DD');
    }
  }
  
  throw new Error(`未找到节气: ${name}`);
};

/**
 * 农历转公历
 */
export const lunarToSolar = (data: LunarToSolarRequestData): string => {
  const { month, day, year, timezone = 'Asia/Shanghai' } = data;
  const targetYear = year || dayjs().tz(timezone).year();
  
  // 创建农历对象并转换为公历
  const lunar = Lunar.fromYmd(targetYear, month, day);
  const solarDate = lunar.getSolar();
  
  // 正确处理时区转换
  return dayjs.tz(
    `${solarDate.getYear()}-${solarDate.getMonth()}-${solarDate.getDay()}`,
    'Asia/Shanghai' // 农历计算使用中国时区
  ).tz(timezone) // 转换为用户指定时区
   .format('YYYY-MM-DD');
};

export const getCalendarInfo = (data: CalendarRequestData): CalendarResponseData => {
  const { date: dateStr, time: timeStr, timezone = 'Asia/Shanghai', config } = data;
  
  // 修复日期解析，正确处理时区
  const parseDate = (dateStr?: string, tz = timezone) => {
    if (!dateStr) return dayjs().tz(tz).toDate();
    
    // 处理YYYY-MM-DD格式，使用指定时区
    return dayjs.tz(dateStr, tz).toDate();
  };
  
  const date = parseDate(dateStr);
  const lunar = Solar.fromDate(date).getLunar();

  // 获取节日信息
  const festivals: Festival[] = [
    ...getLegalFestivals(date.getMonth() + 1, date.getDate(), date.getFullYear()),
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

  // 使用dayjs格式化日期，保持与输入时区一致
  const formattedDate = dayjs.tz(date, timezone).format('YYYY-MM-DD');
  
  return {
    date: formattedDate,
    timezone, // 返回使用的时区
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