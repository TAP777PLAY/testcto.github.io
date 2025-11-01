import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { improveText } from '@/lib/openai';
import { checkAICredits, useAICredit } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const credits = await checkAICredits(user.id);
    if (!credits.hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient AI credits. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const result = await improveText(text);

    const creditUsed = await useAICredit(user.id);
    if (!creditUsed) {
      return NextResponse.json(
        { error: 'Failed to use AI credit' },
        { status: 500 }
      );
    }

    await prisma.aIGenerationLog.create({
      data: {
        userId: user.id,
        type: 'text',
        prompt: `Improve text: ${text.substring(0, 100)}...`,
        result,
        creditsUsed: 1,
        model: 'gpt-4o-mini',
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error improving text:', error);
    return NextResponse.json({ error: 'Failed to improve text' }, { status: 500 });
  }
}
