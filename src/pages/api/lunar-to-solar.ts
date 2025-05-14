import { NextRequest } from 'next/server';
import { lunarToSolar } from '@/services/calendar';
import { LunarToSolarRequestData } from '@/type';

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

    // 验证必要参数
    if (!body.month || !body.day) {
      throw new Error('Month and day are required');
    }

    const result = lunarToSolar(body as LunarToSolarRequestData);
    const response = JSON.stringify({ date: result });

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