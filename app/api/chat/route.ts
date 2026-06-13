import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  const { messages, language = "English" } = await req.json();

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
  const apiKey = process.env.AZURE_OPENAI_KEY!;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;

  // We explicitly tell the AI what language to converse in
  const systemPrompt = `You are Mana, an unhurried, warm, empathetic mental health peer for Indian students facing severe competitive exam stress (JEE, NEET, UPSC). 
  
  CRITICAL INSTRUCTION: You MUST respond to the user entirely in ${language}. Match their tone and cultural context if applicable. Validate their feelings. Be brief, soft, and grounding.
  
  If the conversation reaches a natural wrap-up, append THIS EXACT JSON BLOCK to your final message. 
  IMPORTANT: Even if the conversation is in Hindi or Hinglish, the JSON block MUST be written strictly in ENGLISH.
  [SESSION_LOGGED: {"Primary_Emotion": "anxiety", "Identified_Triggers": ["Parental Pressure", "Physics Mock Test"], "Stress_Level": 8, "Recommended_Coping_Strategy": "5-4-3-2-1 Grounding Technique"}]`;

  const requestBody = {
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
  };

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    let reply = data.choices[0].message.content;

    const logMatch = reply.match(/\[SESSION_LOGGED:\s*(\{.*?\})\s*\]/);
    if (logMatch) {
      const logData = JSON.parse(logMatch[1]);
      reply = reply.replace(logMatch[0], '').trim();
      
      query(
        `INSERT INTO emotional_logs (primary_emotion, stress_score, identified_triggers, recommended_coping_strategy) 
         VALUES ($1, $2, $3, $4)`,
        [logData.Primary_Emotion, logData.Stress_Level, JSON.stringify(logData.Identified_Triggers), logData.Recommended_Coping_Strategy]
      ).catch(err => console.error("DB Insert Failed:", err));
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to connect to Mana' }, { status: 500 });
  }
}