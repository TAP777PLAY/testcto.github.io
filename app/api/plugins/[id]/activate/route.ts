import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plugin = await prisma.plugin.findUnique({
      where: { id: params.id },
      include: { site: true },
    });

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    if (plugin.site && plugin.site.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedPlugin = await prisma.plugin.update({
      where: { id: params.id },
      data: { active: true },
    });

    return NextResponse.json({ plugin: updatedPlugin });
  } catch (error) {
    console.error('Error activating plugin:', error);
    return NextResponse.json(
      { error: 'Failed to activate plugin' },
      { status: 500 }
    );
  }
}
