import { NextResponse } from 'next/server';
import { doAction } from '@/lib/plugin-system/hooks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await doAction('form_submit', body);

    console.log('Contact form submission:', body);

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
