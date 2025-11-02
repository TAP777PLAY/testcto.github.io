import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkFeatureAccess } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const where: any = { active: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const plugins = await prisma.marketplacePlugin.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { downloadCount: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        version: true,
        author: true,
        price: true,
        icon: true,
        category: true,
        tags: true,
        downloadCount: true,
        rating: true,
        reviewCount: true,
        featured: true,
      },
    });

    return NextResponse.json(plugins);
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    const plugin = await prisma.marketplacePlugin.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription,
        version: data.version,
        author: data.author,
        authorUrl: data.authorUrl,
        price: data.price || 0,
        icon: data.icon,
        screenshots: data.screenshots,
        category: data.category,
        tags: data.tags,
        config: data.config,
        code: data.code,
        featured: data.featured || false,
      },
    });

    return NextResponse.json(plugin);
  } catch (error) {
    console.error('Error creating plugin:', error);
    return NextResponse.json({ error: 'Failed to create plugin' }, { status: 500 });
  }
}
