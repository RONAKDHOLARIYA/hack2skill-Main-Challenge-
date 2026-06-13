import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

// The 'params' argument must be typed as a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  // You MUST await params in modern Next.js
  const { type } = await params;

  try {
    switch (type) {
      case 'trends': {
        const res = await query(`
          SELECT DATE(created_at) as date, ROUND(AVG(stress_score), 1) as avg_stress 
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
      case 'recent': { // Added to handle your recent insights
        const res = await query(`
          SELECT id, primary_emotion, recommended_coping_strategy 
          FROM emotional_logs 
          ORDER BY created_at DESC LIMIT 5
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