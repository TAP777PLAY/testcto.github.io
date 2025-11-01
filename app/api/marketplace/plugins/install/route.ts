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

    const { pluginId } = await request.json();

    if (!pluginId) {
      return NextResponse.json({ error: 'Plugin ID is required' }, { status: 400 });
    }

    const plugin = await prisma.marketplacePlugin.findUnique({
      where: { id: pluginId },
    });

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    const existingInstallation = await prisma.installation.findUnique({
      where: {
        userId_pluginId: {
          userId: user.id,
          pluginId: plugin.id,
        },
      },
    });

    if (existingInstallation) {
      return NextResponse.json(
        { error: 'Plugin already installed' },
        { status: 400 }
      );
    }

    const installation = await prisma.installation.create({
      data: {
        userId: user.id,
        type: 'plugin',
        pluginId: plugin.id,
        active: true,
      },
    });

    await prisma.marketplacePlugin.update({
      where: { id: plugin.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(installation);
  } catch (error) {
    console.error('Error installing plugin:', error);
    return NextResponse.json({ error: 'Failed to install plugin' }, { status: 500 });
  }
}
