import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resume = formData.get('resume') as File;

    if (!resume) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      );
    }

    // Convert the file to base64
    const buffer = await resume.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');

    // Send to n8n webhook
    const response = await fetch('https://primary-production-09d3.up.railway.app/webhook-test/match-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: resume.name,
        fileType: resume.type,
        fileSize: resume.size,
        content: base64String,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { error: 'Failed to process resume' },
      { status: 500 }
    );
  }
} 