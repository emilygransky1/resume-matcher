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

    // Create a new FormData to send to n8n
    const n8nFormData = new FormData();
    n8nFormData.append('resume', file);
    n8nFormData.append('filename', file.name);
    n8nFormData.append('contentType', file.type);

    // Log what we're sending
    console.log('Sending to n8n:', {
      fileName: fileDetails.name,
      fileType: fileDetails.type,
      fileSize: fileDetails.size,
      url: 'https://primary-production-09d3.up.railway.app/webhook-test/match-resume'
    });

    // Send to n8n with specific headers
    try {
      const n8nResponse = await fetch('https://primary-production-09d3.up.railway.app/webhook-test/match-resume', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-File-Name': file.name,
          'X-File-Type': file.type,
          'X-File-Size': file.size.toString()
        },
        body: n8nFormData
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