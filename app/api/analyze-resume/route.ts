import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface ResumeResponse {
  success: boolean;
  message?: string;
  matches?: Array<{
    company: string;
    score: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const base64String = btoa(
      Array.from(buffer)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );

    // Send to n8n
    const response = await fetch('https://primary-production-09d3.up.railway.app/webhook-test/match-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file instanceof File ? file.name : 'resume.pdf',
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        content: base64String,
      }),
    });

    const data = (await response.json()) as ResumeResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process file' 
    } as ResumeResponse, { status: 500 });
  }
} 