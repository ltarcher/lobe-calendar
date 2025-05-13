import { NextRequest } from 'next/server';

import { getCalendarInfo } from '@/services/calendar';
import { CalendarRequestData } from '@/type';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as CalendarRequestData;
    const calendarInfo = getCalendarInfo(body);

    // 构建Markdown格式的响应
    let markdown = `## 📅 万年历\n\n`;
    
    // 日期信息
    markdown += `### 📆 日期信息\n`;
    markdown += `- **公历**: ${calendarInfo.date}\n`;
    markdown += `- **星期**: ${calendarInfo.weekDay}\n`;
    markdown += `- **农历**: ${calendarInfo.lunar.year} ${calendarInfo.lunar.month}${calendarInfo.lunar.day}\n`;
    markdown += `- **干支年**: ${calendarInfo.lunar.ganzhi}\n\n`;

    // 四柱信息
    if (calendarInfo.bazi && (!body.config || body.config.showBazi !== false)) {
      markdown += `### � 四柱信息\n`;
      markdown += `- **年柱**: ${calendarInfo.bazi.year}\n`;
      markdown += `- **月柱**: ${calendarInfo.bazi.month}\n`;
      markdown += `- **日柱**: ${calendarInfo.bazi.day}\n`;
      markdown += `- **时柱**: ${calendarInfo.bazi.hour}\n\n`;
    }

    // 节气信息
    if (calendarInfo.solarTerm && (!body.config || body.config.showSolarTerm !== false)) {
      markdown += `### 🌿 节气\n${calendarInfo.solarTerm}\n\n`;
    }

    // 节日信息
    if (calendarInfo.festivals.length > 0 && (!body.config || body.config.showFestivals !== false)) {
      markdown += `### 🎉 节日\n`;
      const traditional = calendarInfo.festivals
        .filter((f) => f.type === 'traditional')
        .map((f) => f.name);
      const legal = calendarInfo.festivals
        .filter((f) => f.type === 'legal')
        .map((f) => f.name);

      if (traditional.length > 0) {
        markdown += `- **传统节日**: ${traditional.join('、')}\n`;
      }
      if (legal.length > 0) {
        markdown += `- **法定节日**: ${legal.join('、')}\n`;
      }
    }

    return new Response(JSON.stringify({ markdown }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}