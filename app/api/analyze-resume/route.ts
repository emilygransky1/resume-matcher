import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: 'No file uploaded' });
    }

    // Enforce PDF only
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Only PDF files are currently supported' 
      });
    }

    // Log file details
    const fileDetails = {
      type: file instanceof File ? file.type : 'application/pdf',
      name: file instanceof File ? file.name : 'resume.pdf',
      size: file.size
    };
    console.log('Received file:', fileDetails);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    // Prepare the data for n8n in a format it can better handle
    const payload = {
      fileName: file instanceof File ? file.name : 'resume.pdf',
      fileType: file.type,
      fileSize: file.size,
      fileContent: base64String
    };

    // Log what we're sending (excluding the base64 content for brevity)
    console.log('Sending to n8n:', {
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      url: 'https://primary-production-09d3.up.railway.app/webhook-test/match-resume'
    });

    // Send to n8n
    try {
      const n8nResponse = await fetch('https://primary-production-09d3.up.railway.app/webhook-test/match-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('n8n response status:', n8nResponse.status);
      
      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error('n8n error details:', {
          status: n8nResponse.status,
          statusText: n8nResponse.statusText,
          error: errorText,
          headers: Object.fromEntries(n8nResponse.headers.entries()),
          url: n8nResponse.url
        });
        throw new Error(`Failed to process with n8n: ${n8nResponse.status} ${errorText}`);
      }

      const n8nData = await n8nResponse.json();
      console.log('n8n success response:', n8nData);

      return NextResponse.json({
        success: true,
        matches: n8nData.matches || []
      });

    } catch (fetchError) {
      console.error('Fetch error details:', {
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        type: fetchError instanceof Error ? fetchError.name : 'Unknown type'
      });
      throw fetchError;
    }

  } catch (error) {
    console.error('Error processing resume:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown type',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process resume' 
    });
  }
} 