import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    const where: any = {};
    if (siteId) {
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { userId: true },
      });

      if (!site || site.userId !== (session.user as any).id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      where.siteId = siteId;
    }

    const plugins = await prisma.plugin.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ plugins });
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plugins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, version, author, siteId, config } = body;

    if (!name || !slug || !version) {
      return NextResponse.json(
        { error: 'Name, slug, and version are required' },
        { status: 400 }
      );
    }

    if (siteId) {
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { userId: true },
      });

      if (!site || site.userId !== (session.user as any).id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const existingPlugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (existingPlugin) {
      return NextResponse.json(
        { error: 'Plugin with this slug already exists' },
        { status: 409 }
      );
    }

    const plugin = await prisma.plugin.create({
      data: {
        name,
        slug,
        description,
        version,
        author,
        siteId,
        config: config || {},
      },
    });

    return NextResponse.json({ plugin }, { status: 201 });
  } catch (error) {
    console.error('Error creating plugin:', error);
    return NextResponse.json(
      { error: 'Failed to create plugin' },
      { status: 500 }
    );
  }
}
