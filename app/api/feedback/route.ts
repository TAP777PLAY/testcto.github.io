import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
    const { type, title, description, email, url, screenshot } = body;

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'Тип, заголовок и описание обязательны' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['bug', 'feature', 'question', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Некорректный тип обратной связи' },
        { status: 400 }
      );
    }

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        type,
        title,
        description,
        email: email || (session?.user?.email || null),
        url: url || null,
        screenshot: screenshot || null,
        userId: session?.user?.id || null,
        status: 'new',
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    // In production, you might want to:
    // - Send email notification to support team
    // - Create GitHub issue automatically
    // - Send to bug tracking system (Sentry, Bugsnag, etc.)

    return NextResponse.json({
      message: 'Спасибо за обратную связь!',
      id: feedback.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить обратную связь' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Get user's feedback
    const feedback = await prisma.feedback.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      { error: 'Не удалось получить обратную связь' },
      { status: 500 }
    );
  }
}
