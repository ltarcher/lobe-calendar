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
    const calendarInfo = getCalendarInfo(body.date);

    // 构建Markdown格式的响应
    let markdown = `## 📅 万年历 - ${calendarInfo.date}\n\n`;
    markdown += `**${calendarInfo.weekDay}**\n\n`;
    markdown += `### 📆 公历\n${calendarInfo.date}\n\n`;
    markdown += `### 🏮 农历\n${calendarInfo.lunar.year} ${calendarInfo.lunar.month}${calendarInfo.lunar.day}\n`;
    markdown += `干支：${calendarInfo.lunar.ganzhi}\n\n`;

    if (calendarInfo.solarTerm) {
      markdown += `### 🌿 节气\n${calendarInfo.solarTerm}\n\n`;
    }

    if (calendarInfo.festivals.length > 0) {
      markdown += `### 🎉 节日\n`;
      const traditional = calendarInfo.festivals
        .filter((f) => f.type === 'traditional')
        .map((f) => f.name);
      const legal = calendarInfo.festivals
        .filter((f) => f.type === 'legal')
        .map((f) => f.name);

      if (traditional.length > 0) {
        markdown += `- 传统节日：${traditional.join('、')}\n`;
      }
      if (legal.length > 0) {
        markdown += `- 法定节日：${legal.join('、')}\n`;
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