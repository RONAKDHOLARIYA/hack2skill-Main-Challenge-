import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const { type } = params;

  try {
    switch (type) {
      case 'trends': {
        const res = await query(`
          SELECT DATE(created_at) as date, AVG(stress_score) as avg_stress 
          FROM emotional_logs 
          WHERE created_at >= NOW() - INTERVAL '14 days'
          GROUP BY DATE(created_at) ORDER BY date ASC
        `);
        return NextResponse.json(res.rows);
      }
      case 'emotions': {
        const res = await query(`
          SELECT primary_emotion as name, COUNT(*) as value 
          FROM emotional_logs 
          GROUP BY primary_emotion
        `);
        return NextResponse.json(res.rows);
      }
      case 'triggers': {
        const res = await query(`
          SELECT jsonb_array_elements_text(identified_triggers) as trigger, 
                 AVG(stress_score) as avg_stress 
          FROM emotional_logs 
          GROUP BY trigger ORDER BY avg_stress DESC LIMIT 10
        `);
        return NextResponse.json(res.rows);
      }
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}