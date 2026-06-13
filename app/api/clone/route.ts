import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('sample') as Blob;

  // Repackage for Cartesia
  const cartesiaFormData = new FormData();
  cartesiaFormData.append('clip', file);
  cartesiaFormData.append('name', `Parent_Voice_${Date.now()}`);

  try {
    const res = await fetch('https://api.cartesia.ai/voices/clone/clip', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY!,
        'Cartesia-Version': '2024-06-10'
      },
      body: cartesiaFormData
    });

    const data = await res.json();
    return NextResponse.json({ voice_id: data.id });
  } catch (error) {
    return NextResponse.json({ error: 'Cloning failed' }, { status: 500 });
  }
}