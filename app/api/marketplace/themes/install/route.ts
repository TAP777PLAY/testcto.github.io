import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkFeatureAccess } from '@/lib/subscription';

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

    const hasAccess = await checkFeatureAccess(user.id, 'marketplace');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Marketplace access requires a premium subscription' },
        { status: 403 }
      );
    }

    const { themeId } = await request.json();

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    const theme = await prisma.marketplaceTheme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    const existingInstallation = await prisma.installation.findUnique({
      where: {
        userId_themeId: {
          userId: user.id,
          themeId: theme.id,
        },
      },
    });

    if (existingInstallation) {
      return NextResponse.json(
        { error: 'Theme already installed' },
        { status: 400 }
      );
    }

    const installation = await prisma.installation.create({
      data: {
        userId: user.id,
        type: 'theme',
        themeId: theme.id,
        active: true,
      },
    });

    await prisma.marketplaceTheme.update({
      where: { id: theme.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(installation);
  } catch (error) {
    console.error('Error installing theme:', error);
    return NextResponse.json({ error: 'Failed to install theme' }, { status: 500 });
  }
}
