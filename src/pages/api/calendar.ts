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
    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      throw new Error('Invalid request body');
    }
    
    const calendarInfo = getCalendarInfo(body as CalendarRequestData);
    const response = JSON.stringify(calendarInfo);
    
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}