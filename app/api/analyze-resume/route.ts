import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: 'No file uploaded' });
    }

    // Log file details
    console.log('Received file:', {
      type: file.type,
      name: file instanceof File ? file.name : 'unknown',
      size: file.size
    });

    // Create a new FormData to send to n8n
    const n8nFormData = new FormData();
    
    // Always send as a File with proper name and type
    const fileToSend = file instanceof File ? file : new File(
      [file],
      'resume.docx',
      { type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );

    // Add the file with the 'resume' field name
    n8nFormData.append('resume', fileToSend);

    // Log what we're sending
    console.log('Sending to n8n:', {
      fileName: fileToSend.name,
      fileType: fileToSend.type,
      fileSize: fileToSend.size
    });

    // Send to n8n
    const n8nResponse = await fetch('https://primary-production-09d3.up.railway.app/webhook-test/match-resume', {
      method: 'POST',
      body: n8nFormData
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n error response:', errorText);
      throw new Error(`Failed to process with n8n: ${n8nResponse.status} ${errorText}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('n8n success response:', n8nData);

    return NextResponse.json({
      success: true,
      matches: n8nData.matches || []
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process resume' 
    });
  }
} 