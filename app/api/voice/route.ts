import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as Blob;
  const voiceId = formData.get('voice_id') as string;

  try {
    // 1. Deepgram STT
    const dgResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`, 'Content-Type': 'audio/webm' },
      body: audioFile
    });
    const dgData = await dgResponse.json();
    const transcript = dgData.results?.channels[0]?.alternatives[0]?.transcript;

    // 2. Azure OpenAI (Similar to text chat, generating response)
    const azureResponse = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': process.env.AZURE_OPENAI_KEY! },
      body: JSON.stringify({ messages: [{ role: 'user', content: transcript }] })
    });
    const azureData = await azureResponse.json();
    let replyText = azureData.choices[0].message.content;

    // (Handle SESSION_LOGGED tag extraction and DB insertion here as in the chat endpoint)
    replyText = replyText.replace(/\[SESSION_LOGGED:.*\]/, '').trim();

    // 3. Cartesia TTS (HTTP Bytes endpoint)
    const cartesiaResponse = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.CARTESIA_API_KEY!,
        'Cartesia-Version': '2024-06-10'
      },
      body: JSON.stringify({
        model_id: "sonic-english",
        transcript: replyText,
        voice: { mode: "id", id: voiceId },
        output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: 44100 }
      })
    });

    const audioBuffer = await cartesiaResponse.arrayBuffer();
    return new NextResponse(audioBuffer, { headers: { 'Content-Type': 'audio/pcm' } });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Audio Pipeline Failed' }, { status: 500 });
  }
}