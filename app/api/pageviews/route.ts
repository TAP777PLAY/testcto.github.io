import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;

    await prisma.pageView.create({
      data: {
        pageId,
        ipAddress,
        userAgent,
        referrer,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
