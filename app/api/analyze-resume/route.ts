import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type ResumeData = {
  filename: string;
  fileType: string;
  fileSize: number;
  content: string;
};

async function fileToBase64(file: Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = uint8Array.reduce((str, byte) => str + String.fromCharCode(byte), '');
  return btoa(binaryString);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No resume file provided or invalid file type' },
        { status: 400 }
      );
    }

    const base64String = await fileToBase64(file);

    const resumeData: ResumeData = {
      filename: 'resume' in file ? file.name : 'unknown.pdf',
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      content: base64String,
    };

    const response = await fetch('https://primary-production-09d3.up.railway.app/webhook-test/match-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze resume: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process resume' },
      { status: 500 }
    );
  }
} 