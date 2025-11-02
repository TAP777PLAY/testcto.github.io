import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePageContent } from '@/lib/openai';
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

    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await generatePageContent(title, description);

    const creditUsed = await useAICredit(user.id, 2);
    if (!creditUsed) {
      return NextResponse.json(
        { error: 'Insufficient AI credits (requires 2 credits)' },
        { status: 403 }
      );
    }

    await prisma.aIGenerationLog.create({
      data: {
        userId: user.id,
        type: 'page',
        prompt: `Title: ${title}, Description: ${description || 'N/A'}`,
        result: JSON.stringify(result),
        creditsUsed: 2,
        model: 'gpt-4o-mini',
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating page:', error);
    return NextResponse.json({ error: 'Failed to generate page' }, { status: 500 });
  }
}
