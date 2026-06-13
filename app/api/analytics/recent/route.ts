import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const res = await query(`
    SELECT primary_emotion, recommended_coping_strategy 
    FROM emotional_logs 
    ORDER BY created_at DESC 
    LIMIT 3
  `);
  return NextResponse.json(res.rows);
}