import { NextRequest } from 'next/server';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

export const config = {
  runtime: 'edge',
};

interface CurrentTimeRequestData {
  timezone?: string;
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { timezone = 'Asia/Shanghai' } = body as CurrentTimeRequestData;
    
    // 获取当前时间，使用指定时区
    const now = dayjs().tz(timezone);
    
    const response = JSON.stringify({
      date: now.format('YYYY-MM-DD'),
      time: now.format('HH:mm:ss'),
      timezone: timezone,
      timestamp: now.valueOf()
    });
    
    // 验证JSON格式
    try {
      JSON.parse(response);
    } catch (e) {
      console.error('Invalid JSON response:', response);
      throw new Error('Failed to generate valid JSON response');
    }

    return new Response(response, {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}